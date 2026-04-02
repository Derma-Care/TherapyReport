 
export const getQuestionsByKey = async (parts) => {
   console.log("parts", parts);
  try {
    const res = await axios.post(
      `${wifiUrl}/api/customer/physiotherapy/questions/getByKey`,
      {
        keys: parts
      }
    );

    return res.data;
  } catch (err) {
    console.error(err);
  }
};