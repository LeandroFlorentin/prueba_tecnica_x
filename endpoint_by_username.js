import moment from "moment-timezone";
const token =
  "AAAAAAAAAAAAAAAAAAAAAFHnwQEAAAAAsKox5hYFuyS2%2BoKuYRbfTb%2B5Id0%3DhixdG0aICxFCzWR1ClV9PsVHnDFKkwM0WTeyi9pl8BT7oryweA";
const url = "https://api.x.com/2/";
const timezone = "America/Argentina/Buenos_Aires";

//configuramos nombres para acceder al endpoint.
const xApi = {
  getPosts: "get_posts",
};
//configuramos el descriptor con el tipo de llamada y el path a devolver en ese endpoint.
const xApiDescriptor = {
  [xApi.getPosts]: {
    type: "GET",
    path: () =>
      `users/by/username/LeannFlorentin?expansions=most_recent_tweet_id&tweet.fields=created_at`,
  },
};
//masajeamos la data para devolver y usar en el endpoint.
function massageData(maxMinutes) {
  const startDate = moment().tz(timezone).subtract(maxMinutes, "minutes");
  const endDate = moment().tz(timezone);
  return { startDate, endDate };
}
//configuramos y devolvemos esa configuración para la llamada asincronica.
function buildConfig(method = "GET", headers = {}, body = {}) {
  return {
    method,
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
    data: body,
  };
}
//Filtros en el array de post
function filtersPosts(posts, filters) {
  const { startDate, endDate, hashtags, maxCount } = filters;
  const newPosts = posts?.reduce((acc, post) => {
    let conditionDate = moment(post.created_at)
      .tz(timezone)
      .isBetween(startDate, endDate);
    if (
      conditionDate &&
      hashtags.some((hashtag) => post.text.includes(hashtag))
    ) {
      acc.push(post);
    }
    return acc;
  }, []);
  return newPosts.slice(0, maxCount);
}
//Funcion que se encarga de realizar el llamado a los posts de la api de X.
async function getPost(maxCount, maxMinutes, hashtags) {
  try {
    const { startDate, endDate } = massageData(maxMinutes);
    const apiData = xApiDescriptor[xApi.getPosts];
    const path = url + apiData.path();
    const config = buildConfig(apiData.type, {
      "Content-Type": "application/json",
    });
    const dataJson = await fetch(path, config);
    const data = dataJson.json();
    const posts = data?.includes?.tweets;
    console.log("TWEETS", posts);
    if (Array.isArray(posts)) {
      const postsFilters = filtersPosts(posts, {
        maxCount,
        startDate,
        endDate,
        hashtags,
      });
      return postsFilters;
    }
    return data;
  } catch (error) {
    return error;
  }
}
//Llamamos a la funcion y vemos el resultado.
getPost(20, 20, ["nuevo"])
  .then((result) => console.log("result", JSON.stringify(result)))
  .catch((error) => console.log("error", JSON.stringify(error)));
