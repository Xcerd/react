const VIP_LEVELS = {
    1: { name: "Trainee", commission: 2 },
    2: { name: "Junior Member", commission: 5 },
    3: { name: "Senior Member", commission: 7 },
    4: { name: "Platinum Member", commission: 10 },
    5: { name: "Diamond Member", commission: 15 },
  };
  
  const REFERRAL_BONUS = 20; // Fixed bonus per referred user
  
  module.exports = { VIP_LEVELS, REFERRAL_BONUS };
  