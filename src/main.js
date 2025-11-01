/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    
    // @TODO: Расчет бонуса от позиции в рейтинге
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных

    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}
//Расчет прибыли
function simpleProfit(item, product) {
    return item.sale_price * item.quantity * (1 - item.discount / 100) - product.purchase_price * item.quantity;
}

//Статистика по прибыли, выручки и других метрик
function baseMetrics(records, calculateProfit, products) {
    return records.reduce((acc, record) => {
        const sellerId = record.seller_id;
        const customerId = record.customer_id;
        if (!acc.sellers[sellerId]) acc.sellers[sellerId] = { revenue:0, profit:
            0, items: [], customers: new Set() }
        if (!acc.customers[customerId]) acc.customers[customerId] = {nrevenue: 0, profit:
            0, sellers: new Set() };

            record.items.forEach(item => {
                const product = products.find(p => p.sku == item.sku);
                const profit = calculateProfit(item, product);

                //обновление статистики продавца
                acc.sellers[sellerId].revenue += item.sale_price * item.quantity *(1
                - item.discount / 100);
                acc.sellers[sellerId].profit += profit;
                acc.sellers[sellerId].items.push(item);
                acc.sellers[sellerId].customers.add(customerId);

                //обновление статистики покупателя
                acc.customers[customerId].revenue += item.sale_price * item.quantity *(1
                 - item.discount / 100);
                acc.customers[customerId].profit += profit;
                acc.customers[customerId].sellers.add(sellerId);

                //обновление статистики по продуктам
                if (!acc.products[item.sku]) acc.products[item.sku] = { quantity: 0,
                revenue: 0 };
                acc.products[item.sku].quantity += item.quantity;
                acc.products[item.sku].revenue += item.sale_price * item.quantity * 
                (1 - item.discount / 100);
            });
            return acc;
        }, {sellers: {}, customers: {}, products: {} });
        
}


console.log(baseMetrics(data.purchase_records, simpleProfit, data.products));


function groupBy(array, keyFn) {
    return array.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}

function calculateSpecialBonuses(data, options, bonusFunctions) {
    const { calculateProfit, accumulateMetrics } = options;

//группировка данных
const recordsBySeller = groupBy(data.purchase_records, record => record.seller_id);
const recordsByCustomer = groupBy(data.purchase_records, record => record.customer_id);
const recordsByProduct = groupBy(data.purchase_records.flatMap(record => record.items), item => item.sku);

//накопительная статистика
const stats = accumulateMetrics(data.purchase_records, calculateProfit, data.products);

//вызов функции для расчета бонусов
return bonusFunctions.map( func =>
    func({
        stats,
        recordsBySeller,
        recordsByCustomer,
        recordsByProduct,
        sellers: data.sellers,
        customers: data.customers,
        products: data.products,
        calculateProfit
    })
);
}