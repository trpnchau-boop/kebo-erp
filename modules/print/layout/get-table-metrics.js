export function getTableMetrics(
  table,
  itemsCount = 0
){

  const headerFontSize =
    table.props?.headerFontSize || 14

  const rowHeight =

    Math.max(

      table.props?.rowHeight || 24,

      headerFontSize + 12

    )

  const headerHeight =

    Math.max(

      rowHeight + 8,

      headerFontSize + 18

    )

  return {

    rowHeight,

    headerHeight,

    tableHeight:

      headerHeight +

      itemsCount * rowHeight

  }

}