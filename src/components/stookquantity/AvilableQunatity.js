const AvailableQuantity = (SaleQuantity, rows) => {
  const aggregatedSaleQuantity = Array.from(
    SaleQuantity.reduce((map, item) => {
      const productCode = item.ProductTrace?.product_code;
      const quantity = parseFloat(item.quantity_no, 10); // Convert quantity to number
      if (!isNaN(quantity)) {
        // Check if quantity is a valid number
        if (map.has(productCode)) {
          map.set(productCode, map.get(productCode) + quantity); // Add quantity to existing total
        } else {
          map.set(productCode, quantity); // Set initial quantity for product code
        }
      }
      return map;
    }, new Map()).entries()
  ).map(([productCode, quantity]) => ({ productCode, quantity }));

  //// pucrhase quantity
  const aggregatedRows = rows.reduce((result, item) => {
    const existingItemIndex = result.findIndex(
      (r) => r.ProductTrace?.product_code === item.ProductTrace?.product_code
    );

    if (existingItemIndex !== -1) {
      const existingItem = result[existingItemIndex];
      existingItem.quantity_no =
        parseFloat(existingItem.quantity_no, 10) +
        parseFloat(item.quantity_no, 10);
    } else {
      result.push({ ...item });
    }

    return result;
  }, []);

  const formattedStock = aggregatedRows.map((item, index) => {
    const availableQuantity = aggregatedSaleQuantity.find(
      (qty) => qty.productCode === item.ProductTrace?.product_code
    );
    return {
      StockId: index + 1,
      invoice_no: item.invoice_no,
      category_name : item.ProductTrace?.Category?.category_name,
      ProductCode: item.ProductTrace?.product_code,
      ProductName: item.ProductTrace?.name,
      ProductType: item.ProductTrace?.type,
      warranty: item.warranty,
      quantity_no: item.quantity_no,
      availableQuantity: availableQuantity
        ? (item.quantity_no - availableQuantity.quantity).toFixed(2)
        : item.quantity_no,
      unit: item.Unit?.unit,
     
      
    };
  });

  return formattedStock;
};

export default AvailableQuantity;
