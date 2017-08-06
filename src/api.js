
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const fakeFetch = async () => {
  console.log('start fetching, it take 500 milliseconds');
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
