import cookieParser from 'cookie-parser';
import { createHash } from 'crypto';

const cookieSecret = createHash('sha256').update('51O4').digest('hex');
const hoursPasswordHash =
  'b1170d000f6a2c4e32d1ba34f7d788efa32bceeaba5f5ff432eb11ac21cd3d81';
const adminPasswordHash =
  'cb59d8384d329f18164b096c627956701b9eac0f975e1c4d6dd5a7d3823da1d8';

function cookieParserMiddleware(req, res, next) {
  return cookieParser(cookieSecret)(req, res, next);
}

function getAuthConfig(req) {
  const isAdmin = req.originalUrl.startsWith('/hours/admin');
  return {
    isAdmin,
    cookieName: isAdmin ? 'adminPassword' : 'password',
    passwordHash: isAdmin ? adminPasswordHash : hoursPasswordHash,
    successRedirect: isAdmin ? '/hours/admin' : '/hours/home',
    failRedirect: '/hours',
  };
}

function hashCheckMiddleware(req, res, next) {
  const { isAdmin, cookieName, passwordHash, successRedirect, failRedirect } =
    getAuthConfig(req);

  //first time auth with query
  if (Object.keys(req.query).length > 0 && req.query.password) {
    if (
      // @ts-ignore
      createHash('sha256').update(req.query.password).digest('hex') ===
      passwordHash
    ) {
      //save password in signed cookie
      res.cookie(cookieName, req.query.password, {
        signed: true,
      });

      //go home timmy
      res.redirect(successRedirect);
    } else {
      //clear invalid query
      res.redirect(failRedirect);
    }
  }

  //cashed auth with cookie
  else if (
    req?.signedCookies?.[cookieName] &&
    createHash('sha256').update(req.signedCookies[cookieName]).digest('hex') ===
      passwordHash
  ) {
    if (!isAdmin && req.baseUrl === '/hours') {
      //go home timmy
      res.redirect(successRedirect);
    } else {
      //let the king pass
      next();
    }
  }

  //invalid auth
  else {
    //remove invalid cookie
    res.clearCookie(cookieName, {
      signed: true,
    });

    if (req.baseUrl === '/hours' && !isAdmin) {
      //let the peasant pass
      next();
    } else {
      //send to get auth
      res.redirect(failRedirect);
    }
  }
}

export default function hoursAuthMiddleware(req, res, next) {
  cookieParserMiddleware(req, res, () => {
    hashCheckMiddleware(req, res, next);
  });
}
