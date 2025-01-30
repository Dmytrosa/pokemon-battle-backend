
export class Pokemon {
  constructor({
    _id,
    id,            
    name,          // { english, japanese, chinese, french }
    type,          // Array of strings, e.g. ["Grass","Poison"]
    base,          // { HP, Attack, Defense, "Sp. Attack", "Sp. Defense", Speed }
    species,       
    description,   
    evolution,     // { prev?: string[][], next?: string[][] }
    profile,       // { height, weight, egg, ability, gender }
    image,         // { sprite, thumbnail, hires }
  }) {
    this._id = _id;

    this.id = id;

    // name: { english, japanese, chinese, french }
    this.name = name; 
    // Масив рядків
    this.type = type; 
    // base: з полями HP, Attack, Defense, "Sp. Attack", "Sp. Defense", Speed
    this.base = base; 

    this.species = species || "";
    this.description = description || "";

    // evolution: { prev?: [ [id, condition], ...], next?: [ [id, condition], ...] }
    this.evolution = evolution || {};

    // profile: {
    //   height: "0.7 m",
    //   weight: "6.9 kg",
    //   egg: ["Monster","Grass"],
    //   ability: [["Overgrow","false"], ["Chlorophyll","true"]],
    //   gender: "87.5:12.5"
    // }
    this.profile = profile || {};

    // image: { sprite, thumbnail, hires } 
    this.image = image || {};
  }
}
