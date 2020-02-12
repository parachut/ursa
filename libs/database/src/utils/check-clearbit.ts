import { User } from '../entities/user.entity';
import { UserEmployment } from '../entities/user-employment.entity';
import { UserSocialHandle } from '../entities/user-social-handle.entity';
import { UserVerification } from '../entities/user-verification.entity';
import { Client } from 'clearbit';
import { pick } from 'lodash';

async function checkClearbit(user: User): Promise<UserVerification> {
  const clearbit = new Client({ key: process.env.CLEARBIT });

  const personFilter: {
    email: string;
    company?: string;
  } = {
    email: user.email,
  };

  if (user.businessName) {
    personFilter.company = user.businessName;
  }

  try {
    const person = await clearbit.Person.find(personFilter);

    Object.assign(user, pick(person, ['bio', 'site', 'avatar']));

    const socialHandles = [];

    if (person.facebook && person.facebook.handle) {
      socialHandles.push({
        handle: person.facebook.handle,
        type: 'FACEBOOK',
        userId: user.get('id'),
      });
    }

    if (person.github && person.github.handle) {
      socialHandles.push({
        handle: person.github.handle,
        type: 'GITHUB',
        userId: user.get('id'),
      });
    }

    if (person.twitter && person.twitter.handle) {
      socialHandles.push({
        handle: person.twitter.handle,
        type: 'TWITTER',
        userId: user.get('id'),
      });
    }

    if (person.linkedin && person.linkedin.handle) {
      socialHandles.push({
        handle: person.linkedin.handle,
        type: 'LINKEDIN',
        userId: user.get('id'),
      });
    }

    const promises: Promise<
      UserVerification | User | UserEmployment | UserSocialHandle[]
    >[] = [
      user.sequelize.models.UserVerification.create<any>({
        type: 'CLEARBIT_PERSON',
        verified: !person.fuzzy,
        meta: person,
        userId: user.get('id'),
      }),
      user.sequelize.models.UserSocialHandle.bulkCreate(socialHandles),
      user.save(),
    ];

    if (person.employment) {
      promises.push(
        user.sequelize.models.UserEmployment.create<any>({
          ...pick(person.employment, [
            'domain',
            'name',
            'title',
            'role',
            'subRole',
            'seniority',
          ]),
          userId: user.get('id'),
        }),
      );
    }

    const [verification] = await Promise.all(promises);

    return verification as UserVerification;
  } catch (e) {
    return user.sequelize.models.UserVerification.create<any>({
      type: 'CLEARBIT_PERSON',
      verified: false,
      meta: e,
      userId: user.get('id'),
    });
  }
}

export default checkClearbit;
