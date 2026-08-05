import slugify from '@sindresorhus/slugify';
const f=(n)=>slugify(n,{separator:'_',lowercase:false,decamelize:false,preserveCharacters:['-','.']});
for (const n of ['Aspect Armour ','Refractor Field ','Rune armour',"'Eavy Armour",'Holo-Suit','Exo-Armour','Terminator Armour']) console.log(JSON.stringify(n),'->',JSON.stringify(f(n)));
