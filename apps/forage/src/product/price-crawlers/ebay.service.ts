import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import eBay from 'ebay-node-client';
const eBayNew = new eBay();
const clientId = process.env.EBAY_CLIENT_ID
const clientSecret = process.env.EBAY_CLIENT_SECRET
eBayNew.setApiKey(clientId, clientSecret);
//eBayNew.setToken('v^1.1#i^1#I^3#f^0#r^0#p^1#t^H4sIAAAAAAAAAOVYa2wUVRTubrclCG0BefiKNgNJhWZm57Hdx9jduN226UpLH1sLNDTlzsyddrqzM5u5M7TrK2sjjf7C+EOMMYaXmhSJyg8iRhN8oBgl0QAaGoMG8BEBY4OBagx6Z3cp20oA6QabOH8m995zz/3O951z752h06VzV400jVwsc8xxbkvTaafDwcyj55aWVJcXO+8qKaLzDBzb0ivSruHin2oRSKhJvgOipK4hWDmUUDXEZzqDhGVovA6QgngNJCDiTZGPhVuaeZai+aShm7qoq0RltD5IcJBh/FCURRCQGVGScK922WenHiTYGonxcNAvBTgf62M5PI6QBaMaMoFm4nGapUmaI2m2kwnwDMt7fBTn83YTlV3QQIquYROKJkIZuHxmrpGH9dpQAULQMLETIhQNN8Zaw9H6hjWdte48X6EcDzETmBaa2oroEqzsAqoFr70MyljzMUsUIUKEO5RdYapTPnwZzE3Az1CNifZ6IWBlmQFeRhILQmWjbiSAeW0cdo8ikXLGlIeaqZip6zGK2RAGoGjmWmuwi2h9pf1qt4CqyAo0gkRDXXh9uK2NCNUDTYFrgUq2AQOI/ZZJxurWkZKXFrySCAAZAFCkAcfmFsp6y9E8baWIrkmKTRqqXKObdRCjhtO5ofO4wUatWqsRlk0bUZ4dy0xyyHTbomZVtMx+zdYVJjARlZnm9RWYnG2ahiJYJpz0MH0gQ1GQAMmkIhHTBzO5mEufIRQk+k0zybvdg4OD1CBH6Uafm6Vpxr2upTkm9sMEILCtXetZe+X6E0glE4oI8Uyk8GYqibEM4VzFALQ+IsQxfrbGl+N9KqzQ9N5/dOTF7J5aEYWqkBraL3h8jAA4WfTU+Auy2YRySeq2cUABpMgEMOLQTKpAhKSI88xKQEOReK5GZjm/DHHaBmTSE5BlUqiRvCQjQ0hDKAhiwP9/KpQbTfUYFA1oFiTXC5bnATlm1K32J7rXdnX1D/oaBLeux2PxiNBXb1gd0voIt1ZuaE8N6J724I1Ww9WDF/UkbNNVRUwVgAG71gvIAmdIOM3MVJ2Vwu0YVFX8mlG4yA53dkltz0fYAUgqlF3elKgn3DrA+7rd1ZtBPKOYw8lkNJGwTCCoMFqYPf0/2s+vGp6CbzyzKiasX1ZIRcpeVaiMmhTaJFIGRLpl4Fsa1Wqf3J16HGp4HzQNXVWh0cXMWOhbp69d6zfEx788Mm4u9sLdV2ZTbouqglOod7ZFdksUVcAsO5MZfKFjfF7OOzNNIxlNO1Oz7Rxq0pEJpauH5mqZ0eXaPfVTP1SUeZhhx3v0sGO/0+GgfTTJVNMrS4sfdhXPJ5BiQgoBTRL0IUoBMoWUPg1/yRqQisNUEiiGs9ShjB0VJ/J+Mmzroe+Y/M0wt5iZl/fPgb7nykgJU7GsDFPD0SwTYFiPr5tefmXUxSx1Lf6o/syS0IfU0o2fPzK61Vs6Oufpw/voskkjh6OkyDXsKFp8rvzsBsHvue3Zlzdv4sYVfknHCw/BzavGms+lvnj9wrFjp51ziqXmkchbsCV6ekPJH9qdD+6LB5vSrx0A31YNXGrcdPxg1ZuuT9//8bkP2p88tMs/vPvP2IXH93yzs2Pr4eM6WTH2cfyd27c+7zxzcMFq/wj/i7jlh5X3L1y/d/vue09O3D3aqL+xvYeoSh46UXt+osL3+7Ni1c6Nn0nje6RXlD0P3Ode4fjyyF7v2+Mnq3ds6ZHHPvk13Lj/6zR/9NK7WxagF2sX9ewaHY8sX7r60a8OHBl4yX3iVHnr7kXCqXOtvU987yrfMP/nhczZKlfdxWdO/nXou2Vlu57q6K2YeNXT0HR+R/Vjjb9VZWX8G3AJCf3+EQAA');


//v^1.1#i^1#I^3#f^0#r^0#p^1#t^H4sIAAAAAAAAAOVYa2wUVRTubrclCG0BefiKNgNJhWZm57Hdx9jduN226UpLH1sLNDTlzsyddrqzM5u5M7TrK2sjjf7C+EOMMYaXmhSJyg8iRhN8oBgl0QAaGoMG8BEBY4OBagx6Z3cp20oA6QabOH8m995zz/3O951z752h06VzV400jVwsc8xxbkvTaafDwcyj55aWVJcXO+8qKaLzDBzb0ivSruHin2oRSKhJvgOipK4hWDmUUDXEZzqDhGVovA6QgngNJCDiTZGPhVuaeZai+aShm7qoq0RltD5IcJBh/FCURRCQGVGScK922WenHiTYGonxcNAvBTgf62M5PI6QBaMaMoFm4nGapUmaI2m2kwnwDMt7fBTn83YTlV3QQIquYROKJkIZuHxmrpGH9dpQAULQMLETIhQNN8Zaw9H6hjWdte48X6EcDzETmBaa2oroEqzsAqoFr70MyljzMUsUIUKEO5RdYapTPnwZzE3Az1CNifZ6IWBlmQFeRhILQmWjbiSAeW0cdo8ikXLGlIeaqZip6zGK2RAGoGjmWmuwi2h9pf1qt4CqyAo0gkRDXXh9uK2NCNUDTYFrgUq2AQOI/ZZJxurWkZKXFrySCAAZAFCkAcfmFsp6y9E8baWIrkmKTRqqXKObdRCjhtO5ofO4wUatWqsRlk0bUZ4dy0xyyHTbomZVtMx+zdYVJjARlZnm9RWYnG2ahiJYJpz0MH0gQ1GQAMmkIhHTBzO5mEufIRQk+k0zybvdg4OD1CBH6Uafm6Vpxr2upTkm9sMEILCtXetZe+X6E0glE4oI8Uyk8GYqibEM4VzFALQ+IsQxfrbGl+N9KqzQ9N5/dOTF7J5aEYWqkBraL3h8jAA4WfTU+Auy2YRySeq2cUABpMgEMOLQTKpAhKSI88xKQEOReK5GZjm/DHHaBmTSE5BlUqiRvCQjQ0hDKAhiwP9/KpQbTfUYFA1oFiTXC5bnATlm1K32J7rXdnX1D/oaBLeux2PxiNBXb1gd0voIt1ZuaE8N6J724I1Ww9WDF/UkbNNVRUwVgAG71gvIAmdIOM3MVJ2Vwu0YVFX8mlG4yA53dkltz0fYAUgqlF3elKgn3DrA+7rd1ZtBPKOYw8lkNJGwTCCoMFqYPf0/2s+vGp6CbzyzKiasX1ZIRcpeVaiMmhTaJFIGRLpl4Fsa1Wqf3J16HGp4HzQNXVWh0cXMWOhbp69d6zfEx788Mm4u9sLdV2ZTbouqglOod7ZFdksUVcAsO5MZfKFjfF7OOzNNIxlNO1Oz7Rxq0pEJpauH5mqZ0eXaPfVTP1SUeZhhx3v0sGO/0+GgfTTJVNMrS4sfdhXPJ5BiQgoBTRL0IUoBMoWUPg1/yRqQisNUEiiGs9ShjB0VJ/J+Mmzroe+Y/M0wt5iZl/fPgb7nykgJU7GsDFPD0SwTYFiPr5tefmXUxSx1Lf6o/syS0IfU0o2fPzK61Vs6Oufpw/voskkjh6OkyDXsKFp8rvzsBsHvue3Zlzdv4sYVfknHCw/BzavGms+lvnj9wrFjp51ziqXmkchbsCV6ekPJH9qdD+6LB5vSrx0A31YNXGrcdPxg1ZuuT9//8bkP2p88tMs/vPvP2IXH93yzs2Pr4eM6WTH2cfyd27c+7zxzcMFq/wj/i7jlh5X3L1y/d/vue09O3D3aqL+xvYeoSh46UXt+osL3+7Ni1c6Nn0nje6RXlD0P3Ode4fjyyF7v2+Mnq3ds6ZHHPvk13Lj/6zR/9NK7WxagF2sX9ewaHY8sX7r60a8OHBl4yX3iVHnr7kXCqXOtvU987yrfMP/nhczZKlfdxWdO/nXou2Vlu57q6K2YeNXT0HR+R/Vjjb9VZWX8G3AJCf3+EQAA
//drone - 179697/bn_89951
//dslr- 31388/bn_732
//mirror - 31388/bn_729
//point - 31388/bn_779
//lenses - 3323/bn_1884683
//action - 11724/bn_82

//all - bn_1865546

@Injectable()
export class EbayService {
  private logger = new Logger('EbayService')

  async insertValues() {

    try {
      const token = await eBayNew.application.getOAuthToken({
        grant_type: 'client_credentials',
        scope: 'https://api.ebay.com/oauth/api_scope'
      });
      console.log(token.access_token);
      eBayNew.setToken(token.access_token);

      //eBayNew.setUserToken(userToken);

      const categoryTreeId = '0';
      const data = {
        category_id: '179697'
      };
      try {
        const response = await eBayNew.taxonomy.getCategorySubtree(categoryTreeId, data);
        console.log('response', JSON.stringify(response));
      } catch (error) {
        console.log('error ', error);
        return;
      }

    } catch (error) {
      console.log('error ', error);
    }



  }
}


// var userToken = utils.USER_TOKEN;
// eBay.setUserToken(userToken);
// var data = {
//     // Leaf Category Name
//     q: 'Video Cables',
//     // Leaf Category Id
//     category_ids: '67859'
// };
// try {
//     var response = await eBay.catalog.search(data);
//     console.log('response', response);
// } catch (error) {
//     console.log('error ', error);
//     return;
// }    


///eBayNew.setUserToken('v^1.1#i^1#f^0#p^3#r^0#I^3#t^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');
