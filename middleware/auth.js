import cookieParser from 'cookie-parser';
import { createHash } from 'crypto';

const cookieSecret = createHash('sha256').update('51O4').digest('hex');
const hoursPasswordHash =
  '9fb9297d179a9e2341c9562f94e88b76d6a3c45fdb3a0cbaca832a22aa99b7b2';

function cookieParserMiddleware(req, res, next) {
  return cookieParser(cookieSecret)(req, res, next);
}

function hashCheckMiddleware(req, res, next) {
  //first time auth with query
  if (Object.keys(req.query).length > 0 && req.query.password) {
    if (
      // @ts-ignore
      createHash('sha256').update(req.query.password).digest('hex') ===
      hoursPasswordHash
    ) {
      //save password in signed cookie
      res.cookie('password', req.query.password, {
        signed: true,
      });

      //go home timmy
      res.redirect('/hours/home');
    } else {
      //clear invalid query
      res.redirect('/hours');
    }
  }

  //cashed auth with cookie
  else if (
    req?.signedCookies?.password &&
    createHash('sha256').update(req.signedCookies.password).digest('hex') ===
      hoursPasswordHash
  ) {
    if (req.baseUrl === '/hours') {
      //go home timmy
      res.redirect('/hours/home');
    } else {
      //let the king pass
      next();
    }
  }

  //invalid auth
  else {
    //remove invalid cookie
    res.clearCookie('password', {
      signed: true,
    });

    if (req.baseUrl === '/hours') {
      //let the peasant pass
      next();
    } else {
      //send to get auth
      res.redirect('/hours');
    }
  }
}

export default function hoursAuthMiddleware(req, res, next) {
  cookieParserMiddleware(req, res, () => {
    hashCheckMiddleware(req, res, next);
  });
}
