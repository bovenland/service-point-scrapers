const postcodeBounds = [1011, 9999]

const postcodes = Array.from({length: postcodeBounds[1] - postcodeBounds[0] + 1})
  .map((_, index) => index + postcodeBounds[0])

module.exports = postcodes
