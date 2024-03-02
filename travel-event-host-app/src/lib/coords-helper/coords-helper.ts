type MongoNumberDecimal = {
  $numberDecimal: string;
};

export const CoordsHelper = {
  /* 
    MongoDb stores lat and lng numbers as strings $numberDecimal field.
    When the data is retrieved from the database, lat and lng are sent over as objects
    similar to the MongoNumberDecimal type. This function converts this to a number so 
    google maps API can use it
  */
  toFloat: (value: MongoNumberDecimal): number => {
    return parseFloat(value.$numberDecimal);
  },
};
