import { User } from '../models/User';
import { UserEmployment } from '../models/UserEmployment';
import { UserSocialHandle } from '../models/UserSocialHandle';
import { UserVerification } from '../models/UserVerification';
import { Client } from 'clearbit';
import pick from 'lodash/pick';

const clearbit = new Client({ key: process.env.CLEARBIT });

async function checkClearbit(user: User): Promise<UserVerification> {
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
        userId: user.id,
      });
    }

    if (person.github && person.github.handle) {
      socialHandles.push({
        handle: person.github.handle,
        type: 'GITHUB',
        userId: user.id,
      });
    }

    if (person.twitter && person.twitter.handle) {
      socialHandles.push({
        handle: person.twitter.handle,
        type: 'TWITTER',
        userId: user.id,
      });
    }

    if (person.linkedin && person.linkedin.handle) {
      socialHandles.push({
        handle: person.linkedin.handle,
        type: 'LINKEDIN',
        userId: user.id,
      });
    }

    const promises: Promise<
      UserVerification | User | UserEmployment | UserSocialHandle[]
    >[] = [
      UserVerification.create({
        type: 'CLEARBIT_PERSON',
        verified: !person.fuzzy,
        meta: person,
        userId: user.id,
      }),
      UserSocialHandle.bulkCreate(socialHandles),
      user.save(),
    ];

    if (person.employment) {
      promises.push(
        UserEmployment.create({
          ...pick(person.employment, [
            'domain',
            'name',
            'title',
            'role',
            'subRole',
            'seniority',
          ]),
        }),
      );
    }

    const [verification] = await Promise.all(promises);

    return verification as UserVerification;
  } catch (e) {
    return UserVerification.create({
      type: 'CLEARBIT_PERSON',
      verified: false,
      meta: e,
      userId: user.id,
    });
  }
}

export default checkClearbit;
