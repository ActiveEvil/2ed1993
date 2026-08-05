import slugify from '@sindresorhus/slugify';
const f=(n)=>slugify(n,{separator:'_',lowercase:false,decamelize:false,preserveCharacters:['-','.']});
for (const n of ['Forward 90° Arc','Physical Armour','Personal Force Fields','Shields','General Armour Special Rules','Unique Armour Special Rules','2D6 Save','Holo-Field','No Close Combat Protection',"'Eavy Armour",'Exo-Armour','Terminator Armour','Primitive Shield','Suppression Shield'])
  console.log(JSON.stringify(n),'->',JSON.stringify(f(n)));
