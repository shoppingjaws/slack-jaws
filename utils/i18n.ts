type LANG = "ja" | "en";
export const i18n =  (en:string,ja?:string) =>{
if(Deno.env.get("LANG") === "ja" && ja){
  return ja
}else {
  return en
}
}