// Returns the time of the last mined block in seconds
export default async function latestTime() {
  let block = await web3.eth.getBlock('latest')
  return block.timestamp;
}
