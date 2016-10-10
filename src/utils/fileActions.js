export function downloadFile(data, fileName) {
  let $link = $('<a></a>').appendTo(document.body);
  $link.attr('href', 'data:' + data);
  $link.attr('download', fileName);
  $link.get(0).click();
  $link.remove();
}
