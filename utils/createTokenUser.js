const createTokenUser = (user) => {
    return { userId: user.__id, name: user.name, role: user.role }
}

module.exports = createTokenUser