{ /** LOG console */
  console.DEBUG_MODE = false
  console.INFO_MODE = false

  console.debug = function() {
    if (console.DEBUG_MODE === true) {
      console.log.apply(this, arguments)
    }
  }

  console.info = function() {
    if (console.INFO_MODE === true) {
      console.log.apply(this, arguments)
    }
  }
}

/** Remplace toutes les occurences d'un caractere contenu dans une chaine de caractère par un autre caractère
 *
 * @param {char} search Le caratère a remplacer
 * @param {char} replacement Le nouveau caractère
 *
 * @returns la chaine de caratère modifiée
 */
String.prototype.replaceAll = function(search, replacement) {
  let target = this
  return target.replace(new RegExp(search, 'g'), replacement);
};


/** Retourne la chaine de caractere situé après la deniere occurence d'un separateur entré en paramètre
 * (ex : C:/User/Program/folder -> last of '/' : folder)
 *
 * @param {char} separator Le séparateur utilisé pour couper dans la chaine
 *
 * @returns La chaine de caratere situé après le separateur entree en parametre
 */
String.prototype.lastOf = function(separator) {
  return this.split(separator)[this.split(separator).length - 1]
}