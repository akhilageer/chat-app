const bottest = ["Sheba", "Chloe", "Pumpkin", "Missy", "Lily", "Sugar", "Muffin", "Lola", "Annie", "Zoe", "Coco", "Lucy", "Salem", "Peanut", "Midnight", "Leo", "Nala", "Sophie", "Kitty", "Whiskers"]

export const generateAvatar = () => {
  const data = [];
  data.push(`https://api.dicebear.com/7.x/bottts/svg?seed=${bottest[Math.floor(Math.random()*100%20)]}`)
  data.push(`https://api.dicebear.com/7.x/avataaars/svg?seed=${bottest[Math.floor(Math.random()*100%20)]}`)
  data.push(`https://api.dicebear.com/7.x/adventurer/svg?seed=${bottest[Math.floor(Math.random()*100%20)]}`)
  data.push(`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${bottest[Math.floor(Math.random()*100%20)]}`)
  data.push(`https://api.dicebear.com/7.x/thumbs/svg?seed=${bottest[Math.floor(Math.random()*100%20)]}`)
  data.push(`https://api.dicebear.com/7.x/big-ears/svg?seed=${bottest[Math.floor(Math.random()*100%20)]}`)
  return data;
};
