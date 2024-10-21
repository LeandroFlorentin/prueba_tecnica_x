import got from "got";
import crypto from "crypto";
import OAuth from "oauth-1.0a";
import qs from "querystring";
import read_line from "readline";

const readline = read_line.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const consumer_key = "Zus4OPQLnEyIIwLE1qNLarymG";
const consumer_secret = "m1VrNmTY1cMfqZoRIWW83gHRYSV5lvN4pR0AWCsROHPiD3LXzG";

const endpointURL = `https://api.twitter.com/2/tweets`;

const requestTokenURL =
  "https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write";
const authorizeURL = new URL("https://api.twitter.com/oauth/authorize");
const accessTokenURL = "https://api.twitter.com/oauth/access_token";

const oauth = OAuth({
  consumer: {
    key: consumer_key,
    secret: consumer_secret,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString, key) =>
    crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

async function input(prompt) {
  return new Promise(async (resolve, reject) => {
    readline.question(prompt, (out) => {
      readline.close();
      resolve(out);
    });
  });
}

async function requestToken() {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: requestTokenURL,
      method: "POST",
    })
  );

  const req = await got.post(requestTokenURL, {
    headers: {
      Authorization: authHeader["Authorization"],
    },
  });
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error("Cannot get an OAuth request token");
  }
}

async function accessToken({ oauth_token }, verifier) {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: accessTokenURL,
      method: "POST",
    })
  );
  const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`;
  const req = await got.post(path, {
    headers: {
      Authorization: authHeader["Authorization"],
    },
  });
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error("Cannot get an OAuth request token");
  }
}

function createDataPost(object) {
  let config = {};
  for (let key in object) {
    if (key === "inReplyTo") config.in_reply_to_tweet_id = object[key];
    else config[key] = object[key];
  }
  return config;
}

async function getRequest({ oauth_token, oauth_token_secret }, dataPost) {
  const token = {
    key: oauth_token,
    secret: oauth_token_secret,
  };
  const data = createDataPost(dataPost);
  const authHeader = oauth.toHeader(
    oauth.authorize(
      {
        url: endpointURL,
        method: "POST",
      },
      token
    )
  );
  const req = await got.post(endpointURL, {
    json: data,
    responseType: "json",
    headers: {
      Authorization: authHeader["Authorization"],
      "user-agent": "v2CreateTweetJS",
      "content-type": "application/json",
      accept: "application/json",
    },
  });
  if (req.body) {
    return req.body;
  } else {
    throw new Error("Unsuccessful request");
  }
}

async function createPost(text, inReplyTo) {
  try {
    // Traer token de autorizacion
    const oAuthRequestToken = await requestToken();
    // Agregar el token que traigo a los params de mi URL
    authorizeURL.searchParams.append(
      "oauth_token",
      oAuthRequestToken.oauth_token
    );
    //URL de redireccion para autorizar
    console.log(
      "Por favor vaya a esta URL para dar permisos de autorización:",
      authorizeURL.href
    );
    const pin = await input("Copie y pegue el PIN aquí: ");
    // Traer el token de acceso (utilizamos trim para eliminar posibles espacios no deseados en el PIN.)
    const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());
    // Creamos el request
    const response = await getRequest(oAuthAccessToken, { text, inReplyTo });
    //Devolvemos la respuesta
    return response;
  } catch (e) {
    return e;
  }
}

createPost("MENSAJE EN VIVO")
  .then((response) => console.log("RESPONSE", response))
  .catch((error) => console.log("ERROR", error));

//Biblioteca npm

import { TwitterApi } from "twitter-api-v2";
//cConfiguramos TwitterApi con las credenciales
const client = new TwitterApi({
  appKey: "Zus4OPQLnEyIIwLE1qNLarymG",
  appSecret: "m1VrNmTY1cMfqZoRIWW83gHRYSV5lvN4pR0AWCsROHPiD3LXzG",
  accessToken: "900378926010298368-SqbpMRmMhuoZcfx0MHwFD5JZTImeHjA",
  accessSecret: "8VTmJTXraSVpspAJWbZRWumDEChB58awX7rwdjzaZhlMG",
});
//Configuramos el objecto de configuracion en caso de existir un parametro que agregar.
function returnConfig(object) {
  const config = {};
  for (let key in object) {
    if (key === "inReplyTo") {
      config.reply = { in_reply_to_tweet_id: object[key] };
    }
  }
  return config;
}
//Creamos la funcion para crear el post, ya sea post directo o respuesta a uno
async function createPost(text, inReplyTo) {
  try {
    const config = returnConfig({ inReplyTo });
    const post = await client.v2.tweet(text, config);
    return post;
  } catch (error) {
    return error;
  }
}
//Ejecutamos la funcion createPost
createPost("RESPONDIENDO EN VIVO", "1848459924235301197")
  .then((response) => console.log("RESPONSE", response))
  .catch((error) => console.log("Error", error));
