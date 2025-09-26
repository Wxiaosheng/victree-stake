export const formatDate = (time: number) => {
  const date = new Date(time);
  // 获取年份、月份和日期
  const year = date.getFullYear();
  const month = date.getMonth() + 1;  // 月份从0开始，所以要加1
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}