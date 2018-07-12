const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name|| !password){
   return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {  //usas transaction cuando tienes que hacer mas de dos cosas
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit) //para que haga los cambios que pusimos arriba
      .catch(trx.rollback) //si algo falla regresas al estado de antes
    })
    .catch(err => res.status(400).json('unable to register'))
})


module.exports = {
  handleRegister: handleRegister
};