
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const fakeFetch = async () => {
  await wait(500);

  return {
    response: {
      status: 200
    }
  }
}

export default {
    fakeFetch
}
