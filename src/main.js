/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // purchase — это одна из записей в поле items из чека в data.purchase_records
  // _product — это продукт из коллекции data.products
  const {
      discount,
      sale_price,
      quantity
  } = purchase; {
      return (sale_price * quantity * (1 - discount / 100) - _product.purchase_price * quantity);
  }
}
// @TODO: Расчет выручки от операции
/**
* Функция для расчета бонусов
* @param index порядковый номер в отсортированном массиве
* @param total общее число продавцов
* @param seller карточка продавца
* @returns {number}
*/
function calculateBonusByProfit(index, total, seller) {
  if (index === 0) {
      return 0.15;
  } else if (index === 1 || index === 2) {
      return 0.1;
  } else if (index === total - 1) {
      return 0;
  } else {
      return 0.05;
  }
  // @TODO: Расчет бонуса от позиции в рейтинге
}
/**
* Функция для анализа данных продаж
* @param data
* @param options
* @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
*/
function analyzeSalesData(data, options) {
  if (!data || !Array.isArray(data.sellers) || data.sellers.length === 0) {
      throw new Error("Некорректные входные данные");
  }
  const {
      calculateRevenue,
      calculateBonus
  } = options;
  typeof calculateRevenue === "function";
  typeof calculateBonus === "function";
  const sellerStats = data.sellers.map((seller) => ({
      seller_id: seller.id,
      name: `${seller.first_name} ${seller.last_name}`,
      revenue: 0,
      profit: 0,
      sales_count: 0,
      products_sold: {},
  }));

  const sellerIndex = Object.fromEntries(sellerStats.map((item) => [item.seller_id, item]));    
  const productIndex = Object.fromEntries(data.products.map((item) => [item.sku, item]));
  console.log(sellerIndex);
  console.log("productIndex", productIndex);
  data.purchase_records.forEach((record) => {
      // Чек
      const seller = sellerIndex[record.seller_id]; 
      // Продавец
      seller.sales_count += 1;
      seller.revenue += record.total_amount;
      //обновление статистики продавца
      // Увеличить количество продаж
      // Увеличить общую сумму всех продаж
      // Расчёт прибыли для каждого товара
      record.items.forEach((item) => {
          const product = productIndex[item.sku]; // Товар
          seller.profit += calculateRevenue(item, product);
          // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
          // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
          // Посчитать прибыль: выручка минус себестоимость
          // Увеличить общую накопленную прибыль (profit) у продавца
          // Учёт количества проданных товаров
          if (!seller.products_sold[item.sku]) {
              seller.products_sold[item.sku] = 0;
          }
          seller.products_sold[item.sku] += 1;
          // По артикулу товара увеличить его проданное количество у продавца
      });
  });
  
  // @TODO: Подготовка итоговой коллекции с нужными полями
  const sellerSort = sellerStats.toSorted(function(a, b) {
      return b.profit - a.profit;
  });
  sellerSort.forEach((seller, index) => {
      const bonus = calculateBonus(index, sellerSort.length, seller);
      seller.bonus = bonus * seller.profit; // Считаем бонус
      seller.top_products = Object.entries(seller.products_sold);
      const oldArray = seller.top_products.map(([key, value]) => ({
          sku: key,
          quantity: value
      })); // Формируем топ-10 товаров
      const newArray = oldArray.toSorted(function(a, b) {
          return b.quantity - a.quantity;
      });
      const top_products = newArray.slice(0, 10);

  });
  
  return sellerSort.map(seller => ({
      seller_id: seller.seller_id,
      name: seller.name,
      revenue: +seller.revenue.toFixed(2),
      profit: +seller.profit.toFixed(2),
      sales_count: seller.sales_count,
      top_products: seller.top_products,
      bonus: +seller.bonus.toFixed(2),
  }));
}