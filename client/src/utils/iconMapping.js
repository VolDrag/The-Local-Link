// Icon Mapping Utility
// Maps category icon strings to react-icons components

import {
  FaHome,
  FaWrench,
  FaPaintRoller,
  FaLaptopCode,
  FaCar,
  FaHeart,
  FaGraduationCap,
  FaUtensils,
  FaCamera,
  FaLeaf,
  FaTshirt,
  FaDumbbell,
  FaPaw,
  FaMusic,
  FaPlug,
  FaQuestion,
  FaTools,
  FaHammer,
  FaFaucet,
  FaBolt,
  FaSnowflake,
  FaCouch,
  FaBroom,
  FaTree,
  FaShieldAlt,
  FaWifi,
  FaMobileAlt,
  FaPrint,
  FaTv,
  FaKeyboard,
  FaLightbulb,
  FaToilet,
  FaDoorOpen,
  FaWindowMaximize
} from 'react-icons/fa';

import {
  MdConstruction,
  MdPlumbing,
  MdElectricBolt,
  MdCleaningServices,
  MdLocalLaundryService,
  MdOutlineRoofing,
  MdCarpenter,
  MdOutlineDesignServices,
  MdPestControl,
  MdAir,
  MdOutlineKitchen,
  MdDeck,
  MdGarage,
  MdSecurity,
  MdOutlineComputer
} from 'react-icons/md';

import {
  GiVacuumCleaner,
  GiPaintBrush,
  GiWindow,
  GiGardeningShears,
  GiHouse
} from 'react-icons/gi';

import {
  BiSolidWasher
} from 'react-icons/bi';

// Icon mapping object
export const iconMap = {
  // Home & Construction
  FaHome,
  FaHammer,
  FaTools,
  FaWrench,
  MdConstruction,
  MdCarpenter,
  MdOutlineRoofing,
  GiHouse,
  
  // Plumbing & Electrical
  MdPlumbing,
  FaFaucet,
  MdElectricBolt,
  FaBolt,
  FaPlug,
  FaLightbulb,
  FaToilet,
  
  // Cleaning & Maintenance
  MdCleaningServices,
  FaBroom,
  GiVacuumCleaner,
  MdLocalLaundryService,
  BiSolidWasher,
  
  // Painting & Design
  FaPaintRoller,
  GiPaintBrush,
  MdOutlineDesignServices,
  FaCouch,
  
  // HVAC & Air
  FaSnowflake,
  MdAir,
  
  // Garden & Outdoor
  FaLeaf,
  FaTree,
  GiGardeningShears,
  MdDeck,
  MdPestControl,
  
  // Technology & IT
  FaLaptopCode,
  MdOutlineComputer,
  FaWifi,
  FaMobileAlt,
  FaPrint,
  FaTv,
  FaKeyboard,
  
  // Vehicle
  FaCar,
  
  // Health & Wellness
  FaHeart,
  FaDumbbell,
  
  // Education
  FaGraduationCap,
  
  // Food & Catering
  FaUtensils,
  MdOutlineKitchen,
  
  // Photography & Media
  FaCamera,
  
  // Fashion & Apparel
  FaTshirt,
  
  // Pets
  FaPaw,
  
  // Music & Entertainment
  FaMusic,
  
  // Security
  FaShieldAlt,
  MdSecurity,
  
  // Other
  FaDoorOpen,
  FaWindowMaximize,
  GiWindow,
  MdGarage,
  
  // Fallback
  FaQuestion
};

/**
 * Get icon component from icon name string
 * @param {string} iconName - Name of the icon (e.g., "FaHome", "MdPlumbing")
 * @returns {React.Component} Icon component
 */
export const getIcon = (iconName) => {
  return iconMap[iconName] || FaQuestion;
};

export default iconMap;
