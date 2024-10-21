import moment from "moment-timezone";
const token =
  "AAAAAAAAAAAAAAAAAAAAAFHnwQEAAAAAsKox5hYFuyS2%2BoKuYRbfTb%2B5Id0%3DhixdG0aICxFCzWR1ClV9PsVHnDFKkwM0WTeyi9pl8BT7oryweA";
const url = "https://api.x.com/2/";

//configuramos nombres para acceder al endpoint.
const xApi = {
  getPosts: "get_posts",
};
//configuramos el descriptor con el tipo de llamada y el path a devolver en ese endpoint.
const xApiDescriptor = {
  [xApi.getPosts]: {
    type: "GET",
    path: ({ filterHashtags, maxCount, startDate, endDate }) =>
      `tweets/search/all?query=${filterHashtags}&max_results=${maxCount}&start_time=${startDate}&end_time=${endDate}`,
  },
};
//masajeamos la data para devolver y usar en el endpoint.
function massageData(maxMinutes, hashtags) {
  const startDate = moment()
    .subtract(maxMinutes, "minutes")
    .format("YYYY-MM-DDTHH:mm:ss");
  const endDate = moment().format("YYYY-MM-DDTHH:mm:ss");
  const filterHashtags = hashtags?.join(" OR ");
  return { startDate, endDate, filterHashtags };
}
//configuramos y devolvemos eas configuración para la llamada asincronica.
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
//Funcion que se encarga de realizar el llamado a los posts de la api de X.
async function getPost(maxCount, maxMinutes, hashtags) {
  try {
    const { filterHashtags, startDate, endDate } = massageData(
      maxMinutes,
      hashtags
    );
    const apiData = xApiDescriptor[xApi.getPosts];
    const path =
      url + apiData.path({ filterHashtags, startDate, endDate, maxCount });
    const config = buildConfig(apiData.type, {
      "Content-Type": "application/json",
    });
    const postsJson = await fetch(path, config);
    const posts = await postsJson.json();
    return posts;
  } catch (error) {
    return error;
  }
}
//Llamamos a la funcion y vemos el resultado.
getPost(20, 5, ["#messi", "#scaloni"])
  .then((result) => console.log("result", result))
  .catch((error) => console.log("error", error));
