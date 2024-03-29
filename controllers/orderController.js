const createOrder = async (req, res) => {
    res.send('create order')
}

const getAllOrders = async (req, res) => {
    res.send('get all order')
}

const getSingleOrder = async (req, res) => {
    res.send('get single order')
}

const getCurrentUserOrders = async (req, res) => {
    res.send('get curent order')
}

const updateOrder = async (req, res) => {
    res.send('update order')
}

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    updateOrder
}