import path from "path";
// Load .env.local then .env so DATABASE_URL is set when Prisma runs (no dotenv-cli needed)
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, DefinitionLevel, DefinitionProvenance, TagKind } from "@prisma/client";

const prisma = new PrismaClient();

// EPA Kids Glossary definitions (from https://archive.epa.gov/climatechange/kids/glossary.html)
// Key: normalized term (lowercase, no extra spaces) for matching
const EPA_GLOSSARY: Record<string, string> = {
  adaptation:
    "Taking actions to avoid, benefit from, or deal with current and future climate change. Adaptation can take place in advance (by planning before an impact occurs) or in response to changes that are already occurring.",
  aerosol:
    "A collection of tiny solid or liquid particles in the atmosphere that can come from natural sources (such as wildfires, dust storms, and volcanoes) or people's activities (such as burning fossil fuels). Some aerosols make the atmosphere warmer because they absorb energy. Others have a cooling effect because they reflect sunlight back to space. Aerosols also influence cloud formation.",
  allergen:
    "A substance, such as pollen, mold, and dust mites, that causes allergies.",
  asthma:
    "A disease that affects a person's lungs and can make it difficult to breathe. Many factors can trigger an asthma attack. For some people, these triggers may include air pollution, allergens, heavy exercise, or certain weather conditions.",
  atmosphere:
    "A mixture of nitrogen, oxygen, carbon dioxide, and other gases that surrounds the Earth. The atmosphere is critical to supporting life on Earth.",
  atom: "The basic building block of all the matter in the universe. Every element (for example, carbon or oxygen) represents a unique type of atom. Atoms combine together to make molecules such as carbon dioxide.",
  barometer:
    "An instrument that measures the air pressure of the atmosphere. Differences in air pressure are responsible for wind and weather patterns, and low pressure is generally associated with storms.",
  biodiesel:
    "A type of biofuel typically made from soybean, canola, or other vegetable oils; animal fats; or recycled grease. Biodiesel can be blended with regular diesel fuel and used in most diesel engines. Some engines can also be modified to run on pure biodiesel.",
  biofuel:
    "A type of fuel produced from plants or other forms of biomass. Examples of biofuels include ethanol, biodiesel, and biogas.",
  biogas:
    "A type of biofuel that contains methane from landfills, animal waste, sewage, or other decomposing waste materials. Biogas can be burned to produce heat or electricity.",
  biomass:
    "Material that comes from living things, including trees, crops, grasses, and animals and animal waste. Some kinds of biomass, such as wood and biofuels, can be burned to produce energy.",
  carbon: "A chemical element that is essential to all living things. Carbon combines with other elements to form a variety of different compounds. Plants and animals are made up of carbon compounds, and so are certain minerals. Carbon combines with oxygen to make a gas called carbon dioxide.",
  "carbon cycle":
    "The movement and exchange of carbon through living organisms, the ocean, the atmosphere, rocks and minerals, and other parts of the Earth. Carbon moves from one place to another through various chemical, physical, geological, and biological processes.",
  "carbon dioxide":
    "A colorless, odorless greenhouse gas. It is produced naturally when dead animals or plants decay, and it is used by plants during photosynthesis. People are adding carbon dioxide into the atmosphere, mostly by burning fossil fuels such as coal, oil, and natural gas. This extra carbon dioxide is the main cause of climate change.",
  "carbon dioxide equivalent":
    "A unit of measurement that can be used to compare the emissions of various greenhouse gases based on how long they stay in the atmosphere and how much heat they can trap. For example, over a period of 100 years, 1 pound of methane will trap as much heat as 21 pounds of carbon dioxide. Thus, 1 pound of methane is equal to 21 pounds of carbon dioxide equivalents.",
  "carbon footprint":
    "The total amount of greenhouse gases that are emitted into the atmosphere each year by a person, family, building, organization, or company. A person's carbon footprint includes greenhouse gas emissions from fuel that he or she burns directly, such as by heating a home or riding in a car. It also includes greenhouse gases that come from producing the goods or services that the person uses, including emissions from power plants that make electricity, factories that make products, and landfills where trash gets sent.",
  "carbonic acid":
    "An acid that forms when carbon dioxide dissolves in water. As people add more carbon dioxide to the atmosphere, the world's oceans absorb some of the extra carbon dioxide and it turns into carbonic acid. Extra carbonic acid is making the oceans more acidic, which can make it harder for corals and shellfish to build their skeletons and shells.",
  climate:
    "The average weather conditions in a particular location or region at a particular time of the year. Climate is usually measured over a period of 30 years or more.",
  "climate change":
    "A significant change in the Earth's climate. The Earth is currently getting warmer because people are adding heat-trapping greenhouse gases to the atmosphere. The term \"global warming\" refers to warmer temperatures, while \"climate change\" refers to the broader set of changes that go along with warmer temperatures, including changes in weather patterns, the oceans, ice and snow, and ecosystems around the world.",
  "climate model":
    "A series of calculations run on a computer that simulates how the atmosphere, oceans, land, living things, ice, and energy from the sun affect each other and the Earth's climate. Scientists use these models to study the Earth's climate and predict how it might respond to changing conditions, such as an increase in greenhouse gases in the atmosphere.",
  coal: "A dark-colored solid fossil fuel that can be mined from the Earth. Coal is the most abundant fossil fuel produced in the United States.",
  concentration:
    "The amount of a particular substance that exists within a certain volume or weight of air, water, soil, or other medium. For example, scientists measure the concentration of a particular gas (such as carbon dioxide) in the atmosphere in units of parts per million.",
  "coral bleaching":
    "The process that takes place when corals lose the microscopic organisms called algae that live within their tissues. These algae provide the coral with nutrients, and they're responsible for the color of the coral. If a disturbance such as rising water temperature causes the algae to leave, corals will appear white (or bleached) and could eventually die.",
  data: "A collection of facts, numbers, or other pieces of information. Scientists use a variety of techniques to gather data about the Earth's climate. A single fact is called a datum (the singular form of data).",
  decomposition:
    "The breakdown of matter by bacteria and fungi. Decomposition changes the chemical makeup and physical appearance of materials.",
  drought:
    "A period of unusually dry weather lasting long enough to cause serious shortages of water for ecosystems and human use (such as drinking water and agriculture) in the affected area.",
  ecosystem:
    "A natural community of plants, animals, and other living organisms and the physical environment in which they live and interact.",
  element:
    "A substance that cannot be chemically separated or broken down into other substances. All matter is composed of elements. Carbon and oxygen are examples of elements, but carbon dioxide is not an element because it can be broken down into carbon and oxygen.",
  emissions:
    "The release of a gas (such as carbon dioxide) or other substance into the air.",
  energy: "The ability to do work. Energy comes in many forms, such as heat, light, motion, and electricity. Most of the world's energy comes from burning fossil fuels to produce heat, which can then be converted into other forms of energy, such as motion (for example, driving a car) or electricity.",
  "energy audit":
    "The process of inspecting a home, workplace, or other building in order to find ways to use less energy. For example, people might find places where they can seal cracks around windows to prevent heat from escaping during the winter.",
  "energy vampire":
    "An appliance or device that uses electricity even when it is turned off.",
  erosion:
    "The wearing down of land by wind or water. Erosion can be made worse by certain types of farming and logging, road building, and clearing land for development.",
  ethanol:
    "A type of alcohol that can be produced from different forms of biomass, such as agricultural crops. Ethanol can be burned as a fuel, often by blending it with gasoline.",
  "fluorinated gas":
    "A group of powerful greenhouse gases that can stay in the atmosphere for hundreds to thousands of years. Fluorinated gases are manmade; they do not occur naturally. They are used in refrigeration and air-conditioning systems, fire extinguishers, foam products, and other products.",
  "fossil fuel":
    "A type of fuel that forms deep within the Earth. Examples of fossil fuels include coal, oil, and natural gas. Fossil fuels are created over millions of years as dead plant and animal material becomes trapped and buried in layers of rock, and heat and pressure transform this material into a fuel. All fossil fuels contain carbon, and when people burn these fuels to produce energy, they create carbon dioxide.",
  "geothermal energy":
    "Heat from inside the Earth. People can use geothermal energy to heat buildings or produce electricity.",
  "global climate": "The average climate around the world.",
  "global warming":
    "An increase in temperature near the surface of the Earth. Global warming has occurred in the distant past as the result of natural causes. However, the term is most often used to refer to recent and ongoing warming caused by people's activities. Global warming leads to a bigger set of changes referred to as global climate change.",
  "global warming potential (gwp)":
    "A measure of how much heat a substance can trap in the atmosphere. GWP can be used to compare the effects of different greenhouse gases. For example, methane has a GWP of 21, which means over a period of 100 years, 1 pound of methane will trap 21 times more heat than 1 pound of carbon dioxide (which has a GWP of 1).",
  "greenhouse gas":
    'Also sometimes known as "heat trapping gases," greenhouse gases are natural or manmade gases that trap heat in the atmosphere and contribute to the greenhouse effect. Greenhouse gases include water vapor, carbon dioxide, methane, nitrous oxide, and fluorinated gases.',
  "ground water":
    "Water that occurs below the surface of the Earth, where it occupies spaces in soil or layers of rock. When rain falls to the ground, some of it sinks into the ground and becomes ground water.",
  habitat: "The place or environment where a plant or animal naturally lives and grows.",
  "heat stroke":
    "A medical condition that results from being exposed to high temperatures. A person's body temperature rises rapidly and he or she is unable to cool down by sweating.",
  "heat wave":
    "A long period of abnormally hot weather, typically lasting for several days.",
  "hydroelectric dam":
    "A power plant that uses the energy from moving water to produce electricity. Moving water spins a turbine, which is connected to a generator.",
  hypothermia:
    "A medical condition in which a person's body temperature becomes abnormally low, usually because of exposure to cold air or water. Severe hypothermia can lead to death.",
  "incandescent light bulb":
    "The most common type of light bulb, which produces light when electricity heats a thin metal wire. Incandescent bulbs use more electricity than newer compact fluorescent light bulbs (CFLs).",
  "infectious disease":
    "A disease caused by bacteria, a virus, or other organisms.",
  "infrared radiation":
    "A type of electromagnetic radiation. The Earth gives off energy in the form of infrared radiation, which is not visible to the naked eye and feels like heat to the human body.",
  infrastructure:
    "Physical structures that allow society to function. Examples include buildings, roads, water pipelines, sewers, electric power lines, railways, and airports.",
  "invasive species":
    "A type of plant, animal, or other organism that does not naturally live in a certain area but has been introduced there, often by people. An invasive species can spread quickly, especially if it has no natural predators in its new home. An invasive species can hurt native species, disrupt ecosystems, and create problems for people (for example, weeds and insects that damage crops).",
  "kilowatt-hour":
    "A unit for measuring the use of electricity. The cost of an electric bill depends on how many kilowatt-hours the customer used. A microwave or toaster running for an hour will use about 1 kilowatt-hour.",
  latitude:
    "A measure of how far north or south a particular place is located on the Earth. Latitude is measured in degrees (°). The equator has a latitude of 0°. The North Pole's latitude is 90° north, and the South Pole's latitude is 90° south.",
  "light-emitting diode (led)":
    "A device that uses a material called a semi-conductor to produce light without using a lot of electricity. LEDs are commonly used as indicator lights on electrical devices, but they are now being used more often for general lighting.",
  magma: "Hot, melted rock under the Earth's crust. Magma becomes lava when it is released through a volcano or other methods.",
  methane:
    "A colorless, odorless greenhouse gas. It occurs both naturally and as a result of people's activities. Methane is produced by the decay of plants, animals, and waste, as well as other processes. It is also the main ingredient in natural gas.",
  "natural gas":
    "A fossil fuel that is an odorless, colorless gas. Natural gas consists of 50 to 90 percent methane.",
  "nitrous oxide":
    "A colorless, odorless greenhouse gas. It occurs both naturally and as a result of people's activities. Major sources include farming practices (such as using fertilizers) that add extra nitrogen to the soil, burning fossil fuels, and certain industrial processes.",
  "nonrenewable resource":
    "A natural resource that cannot be produced, regrown, or reused fast enough to keep up with how quickly it is used. Fossil fuels such as coal, oil, and natural gas, for example, take millions of years to develop naturally. Thus, their supply for people to use is considered nonrenewable.",
  "nuclear fission":
    "A process that occurs when an atom splits into two smaller atoms, which releases some of the energy that was binding the parts of the atom together. A nuclear power plant uses a controlled fission reaction to produce heat, which is then converted to electricity.",
  oil: "A dark-colored liquid fossil fuel found underground. Raw (crude) oil can be refined to produce a variety of different products, such as gasoline, diesel, home heating fuel, asphalt, and chemicals that can be used to make paint, plastics, and many other everyday products.",
  ozone: "A gas made up of three atoms of oxygen bonded together. High in the atmosphere, ozone naturally shields the Earth from harmful ultraviolet radiation that comes from the sun. Closer to the Earth's surface, ozone is a pollutant that is formed by other pollutants that react with each other. Ozone is also a greenhouse gas.",
  "parts per million":
    "A unit of measurement that can be used to describe the concentration of a particular substance within air, water, soil, or some other medium. For example, the concentration of carbon dioxide in the Earth's atmosphere is almost 400 parts per million, which means 1 million liters of air would contain about 400 liters of carbon dioxide.",
  "passive solar heating":
    "The use of windows, building materials, and other features to take advantage of sunlight to heat the inside of a building.",
  permafrost:
    "Soil or rock that is frozen year-round. Permafrost can be found in many parts of Alaska, northern Canada, and other countries near the Arctic Ocean. Even though the soil at the surface of the Earth may not be frozen during the warmer months, a layer of permafrost may exist several feet below.",
  photosynthesis:
    "The process by which green plants use sunlight, water, and carbon dioxide to make food and other substances that they use to grow. In the process, plants release oxygen into the air.",
  "photovoltaic cell":
    "A device that converts energy from sunlight into electricity. Photovoltaic cells use a material such as silicon, which is called a semi-conductor.",
  "plate tectonics":
    "A scientific theory that describes how large sections of the Earth's crust called plates move over time. The Earth has seven or eight major plates, including the North American plate, plus many smaller plates. As these plates collide, spread apart, or grind alongside one another, they cause earthquakes and volcanic activity.",
  "positive feedback loop":
    "A process in which one change leads to another, which then causes even more of the original change. In climate change, a positive feedback loop occurs when warming causes changes that lead to even more warming. For example, as the Earth gets warmer, the amount of ice that covers the Arctic Ocean is shrinking, which leaves more open water. Ice reflects a lot of sunlight back into space, while the open ocean is dark and absorbs more of the sun's energy, making the Earth warmer. Thus, melting ice causes the Earth to absorb more energy from the sun and become even warmer.",
  precipitation:
    "Rain, hail, mist, sleet, snow, or any other moisture that falls to the Earth.",
  "product life cycle":
    "The many steps that go into creating, using, and disposing of a product. A product life cycle typically starts by removing raw materials from the Earth (for example, cutting down trees, mining metals, or pumping oil). These raw materials are then transported, processed, and manufactured into usable products. Next, the product is packaged and transported to a place where people can buy it. The final steps occur when people use up, throw away, or recycle the product.",
  radiation:
    "Energy that travels in the form of a particle or a wave. There are many different types of radiation. Some types can harm people, while others are harmless and actually quite important to everyday life. Several common forms of radiation are classified as \"electromagnetic radiation,\" including radio and TV waves, X-rays, ultraviolet radiation, infrared radiation, and visible light.",
  "rain gauge":
    "An instrument that measures the amount of rain that has fallen in a particular place.",
  recycle:
    "To collect and reprocess a material so it can be used again to make a new product. An example is collecting aluminum cans, melting them, and using the aluminum to make new cans or other products.",
  refrigerant:
    "A substance that is used for cooling or heating because of its ability to absorb and transfer energy. For example, in a geothermal heat pump, a liquid refrigerant travels through pipes, absorbing heat from underground and then bringing this heat into a building.",
  "regional climate":
    "An average of the weather in a particular area over many years. Regional climate influences which kinds of plants and animals can live in a particular area. Factors that influence regional climate include latitude, landforms, nearby bodies of water, and circulation patterns in the ocean and the atmosphere.",
  "renewable resource":
    "A natural resource that can be produced, regrown, or reused fast enough to keep up with how quickly it is used. Wind, tides, and solar energy, for example, are in no danger of running out and can be consumed by people virtually forever. In contrast, fossil fuels such as coal take millions of years to develop naturally and are considered nonrenewable.",
  smog: "Air pollution caused by chemical reactions of various pollutants emitted from different sources. Ozone is one of the main ingredients of smog, and it can harm people's health.",
  snowpack:
    "The amount of snow that accumulates on the ground. Snowpack can be an important water resource when it melts and feeds into streams and rivers. This is particularly true in cold mountainous areas that accumulate a lot of snow during the winter.",
  "solar energy":
    "Energy from the sun, which can be converted into other forms of energy such as heat or electricity.",
  "solar panel":
    "A device that can convert energy from the sun into energy for people to use. Some types of solar panels convert sunlight directly into electricity. Others use sunlight to heat water, which can then be used to provide heat or hot water to a building.",
  "solar thermal technology":
    "A system that uses sunlight to heat water or create steam, which can then be used to generate electricity.",
  subtropics:
    "The parts of the Earth immediately north and south of the tropics. The southern part of the United States is considered subtropical.",
  sunspot:
    "A dark area that forms and disappears on the surface of the sun over periods of days or weeks. The amount of sunspot activity varies over time, but it tends to follow a roughly 11-year cycle. This sunspot cycle causes slight differences in the amount of energy that the sun gives off.",
  "thermal expansion":
    "The increase in volume of a material as it gets warmer. For example, water expands as it is heated, causing each drop of water to increase in size. In the ocean, thermal expansion is one cause of rising sea level.",
  "tidal power":
    "A form of renewable energy generated from the natural rise and fall of the ocean.",
  tides: "A variation in the surface level of the oceans caused by the gravitational pull of the moon and sun. Tides fluctuate between high and low twice a day.",
  tropics:
    "The parts of the Earth near the Equator, which are very warm all year long because they receive a lot of direct sunlight.",
  turbine:
    "A device with blades that can be turned by a force such as wind, water, or high pressure steam. The energy of a spinning turbine is converted into electricity by a generator.",
  "ultraviolet (uv) radiation":
    "A type of electromagnetic radiation that is produced by the sun. UV radiation is not visible to the naked eye. Most UV radiation is blocked by ozone high in the Earth's atmosphere, but some of it reaches the Earth's surface. Being exposed to too much UV radiation can cause a sunburn, and over time it can lead to skin cancer and eye damage. Too much UV radiation can also harm plants.",
  uranium:
    "A heavy, naturally radioactive, metallic element that is used to produce nuclear power.",
  "waste-to-energy":
    "The process of burning solid waste, landfill gas, tires, or other forms of waste to produce heat or electricity.",
  "waterborne disease":
    "A disease caused by bacteria or other organisms that live in water. A person can get a waterborne disease if they drink or come in contact with contaminated water. Cholera and E. coli are examples of waterborne diseases.",
  "water vapor":
    "Water that is present in the atmosphere as a gas. Water vapor is a greenhouse gas and plays an important role in the natural greenhouse effect. Clouds form when extra water vapor in the atmosphere condenses to form ice, water droplets, and precipitation.",
  watt: "A measurement of power, usually used when talking about electricity. A watt measures the rate at which energy is used.",
  weather:
    "The condition of the atmosphere at a particular place and time. Some familiar characteristics of the weather include wind, temperature, humidity, atmospheric pressure, cloudiness, and precipitation. Weather can change from hour to hour, day to day, and season to season.",
  wetland:
    "An area of land that is periodically saturated with water, which influences the types of plants and animals that can live there. Wetlands include swamps, marshes, bogs, and other similar areas.",
  "wind turbine":
    "A machine that converts energy from the wind into electricity. The wind spins a set of blades connected to a generator.",
};

const EPA_GLOSSARY_URL =
  "https://archive.epa.gov/climatechange/kids/glossary.html";
const EPA_SOURCE_TITLE = "A Student's Guide to Global Climate Change | US EPA";

// Bioregion / biogeography terms — scientific definitions from https://en.wikipedia.org/wiki/Bioregion
// Key: normalized term (lowercase) for matching
const BIOREGION_GLOSSARY_URL = "https://en.wikipedia.org/wiki/Bioregion";
const BIOREGION_GLOSSARY: Record<string, string> = {
  domain:
    "A biogeographical domain is a macroecological region spanning a continent or group of continents or major bioclimatic regions, which can be used to study the dispersal of particular species. Example: isoclimatic Mediterranean. Scale: continental or global.",
  realm:
    "In biogeography, realms most often refer to the broadest classification of Earth's land surface, based on distributional patterns of terrestrial organisms in eight major divisions. Within the IUCN Ecosystem Typology, Level 1 'realms' refer to 5 major divisions of the biosphere—Terrestrial, Subterranean, Freshwater, Marine, Atmospheric. Example: 'terrestrial' or 'Nearctic'. Scale: continental or global.",
  biome:
    "A standardized typology for large-scale areas characterized by vegetation, soil, climate, and wildlife in 14 major categories per Dinerstein et al. Within the IUCN Ecosystem Typology, Level 2 'biomes' are reduced to 7 'core' terrestrial types, including an anthropogenic land-use type, and several additional 'transitional' biome types. Example: temperate grasslands and savannas. Scale: sub-continental.",
  "functional group":
    "A hierarchical classification system that, in its upper levels, defines ecosystems by their convergent ecological functions (biomes) and, in its lower levels, distinguishes ecosystems with contrasting assemblages of species engaged in those functions. Within the IUCN Ecosystem Typology these are Level 3 'functional groups'. Example: trophic savannas. Scale: sub-continental.",
  ecozone:
    "A division of the Earth's land surface distinguished by the evolutionary histories and distribution patterns of its life forms. Ecozones can refer both to biome-scale divisions (per J. Schulz) or continent-scale divisions (per Cox et al.). Example: Great Plains (e.g. 9 per EPA). Scale: sub-continental (EPA Level I ecoregion) or continental.",
  "biotic province":
    "Specific biogeographical areas on land and sea delineated by common landforms and ecological conditions. Also called province or ecoprovince. Example: S. Central Semi-arid Prairies (terrestrial), Louisianan province (marine). Scale: regional (EPA Level II ecoregion).",
  ecoregion:
    "Areas which harbor ecosystems generally similar in character as defined by prevalent flora and fauna across both terrestrial and marine domains. Within the IUCN Ecosystem Typology these are comparable to Level 4 'regional subgroups'. Example: Cross Timbers savanna-woodland, N. Gulf of Mexico. Scale: sub-regional (EPA Level III ecoregion).",
  ecosystem:
    "A specific community of interacting organisms and the interactions of biotic and abiotic components in a given area, generally defined at smaller scales. Example: Northern Cross Timbers (e.g. 29a per EPA). Scale: local (EPA Level IV ecoregion).",
  ecotone:
    "A transition area between two biological communities where two communities meet and integrate. Also called ecoline. Example: Thames estuary. Scale: sub-regional or local.",
  "zoogeographic region":
    "Areas with relatively uniform conditions defining distinct animal population ranges. Example: lion range. Scale: sub-continental or regional.",
  "phytogeographic region":
    "Areas with relatively uniform climatic conditions defining distinct plant populations. Example: floristic kingdom. Scale: sub-continental or regional.",
  chorotype:
    "The delineation of groups of species that have coincident ranges (there are two differing uses of the term in biogeography). Example: holarctic chorotype. Scale: sub-continental or regional.",
  "area of endemism":
    "A single defined geographic location that is the only place where a particular species (or several species) can be found (e.g. islands). Abbreviation: AoE. Example: Austral Patagonia. Scale: sub-continental or regional.",
  "concrete biota":
    "All the flora and fauna species encountered in all habitats within an area surrounding a particular locality; the lowest (most elementary) level of floral/faunal organization of the biota. Example: concrete flora or concrete fauna. Scale: local or sub-regional.",
  "centre of endemism":
    "A specific geographic area from which species originate and disperse. Also called nuclear area. Example: The Yucutan centre. Scale: sub-continental or regional.",
  phytocorion:
    "A specific geographic area possessing a large number of distinct plant taxa. Also called floristic province. Example: Zambezian phytocorion. Scale: sub-continental or regional.",
  chronofauna:
    "A geographically restricted natural assemblage of interacting animal populations maintained over a geologically significant period of time. Related: horofauna—an assemblage of animal groups that coexist and diversify in a given area over a prolonged time, representing a lasting biogeographic unit. Example: Permian vertebrate chronofauna. Scale: sub-continental or regional.",
  cenocron:
    "A given area in which an animal or plant group or community has entered, wherever its origin, within a defined period of geological time, used in cladistic biogeography. Example: Mexican Plateau cenocron. Scale: continental or sub-continental.",
  "generalized track":
    "A graph of geographic distribution that connects the different localities or distribution areas of a particular taxon or group of taxa (L. Croizat). Example: ratite birds track. Scale: global or continental.",
  "species assemblage":
    "A group of organisms belonging to a number of different species that co-occur regionally and interact through trophic and spatial relationships. Related terms include biogeographical assemblage and taxonomic assemblage. Example: Terai Arc Landscape. Scale: sub-continental or regional.",
  biotope:
    "The natural environment or 'home' in which an organism or population normally lives through a significant portion of its life cycle. Also called ecotope or habitat. Example: European butterfly biotope. Scale: sub-regional or local.",
  "climate zone":
    "Climatological: maps of land divided based on patterns of seasonal precipitation, humidity, and temperature (Köppen climate classifications, Hardiness Zones, etc.). Example: Hardiness zone (e.g. 7a, 7b, 7c). Scale: continental or sub-continental.",
  landform:
    "Topographical: maps of the forms and features of land surfaces creating natural boundaries across distance and elevation (e.g. mountains, ravines, basins, plateaus, etc.). Example: Tibetan Plateau. Scale: sub-continental or regional.",
  "soil zone":
    "Pedological: maps of soil types by major classifications including soil texture (e.g. sandy, clay, etc.). Example: Histosol region. Scale: sub-continental or regional.",
  watershed:
    "Hydrological: maps of drainage basins or 'watersheds' where all flowing surface water converges to a single point, such as a spring or lake, or flows into another body of water. Example: Hudson Valley. Scale: sub-continental or regional.",
  "cultural area":
    "Anthropological: tribal domains or territories based on historical and cultural knowledge of Indigenous Peoples and local communities. Also called cultural region. Example: Zuni Nation. Scale: regional or sub-regional.",
};

// One Earth Bioregions Framework (2023) — 14 major biome types — https://www.oneearth.org/bioregions-2023/
// Key: normalized name (no color) for matching
const ONE_EARTH_BIOREGIONS_URL = "https://www.oneearth.org/bioregions-2023/";
const ONE_EARTH_BIOMES: Record<string, string> = {
  "deserts & xeric shrublands":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by desert and xeric (dry) shrubland ecosystems. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "mountain grasslands & shrublands":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by montane grasslands and shrublands. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "temperate grasslands, savannas & shrublands":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by temperate grasslands, savannas, and shrublands. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "tropical & subtropical grasslands, savannas & shrublands":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by tropical and subtropical grasslands, savannas, and shrublands. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "flooded grasslands & savannas":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by flooded grasslands and savannas. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  mangroves:
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Coastal wetland ecosystems; in the framework, mangrove ecoregions often span multiple bioregions. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "mediterranean forests, woodlands & scrub":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by Mediterranean forests, woodlands, and scrub. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "temperate broadleaf & mixed forests":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by temperate broadleaf and mixed forests. One of six forest subtypes in the framework. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "temperate conifer forests":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by temperate conifer forests. One of six forest subtypes in the framework. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "tropical & subtropical coniferous forests":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by tropical and subtropical coniferous forests. One of six forest subtypes in the framework. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "tropical & subtropical dry broadleaf forests":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by tropical and subtropical dry broadleaf forests. One of six forest subtypes in the framework. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "tropical & subtropical moist broadleaf forests":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by tropical and subtropical moist broadleaf forests. One of six forest subtypes in the framework. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  "boreal forests/taiga":
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Boreal forests and taiga. One of six forest subtypes in the framework. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
  tundra:
    "One of the 14 major terrestrial biome types in the One Earth Bioregions Framework (2023). Characterized by tundra ecosystems. Provides the highest-order organizing principle for delineating the world's 185 bioregions. Scale: sub-continental.",
};

// Our World in Data — the "Big Five" mass extinctions — https://ourworldindata.org/mass-extinctions
// Key: normalized name for matching
const OWID_MASS_EXTINCTIONS_URL = "https://ourworldindata.org/mass-extinctions";
const OWID_MASS_EXTINCTIONS: Record<string, string> = {
  "end ordovician":
    "One of the 'Big Five' mass extinctions in Earth's history (444 million years ago). About 86% of species were lost. Cause: intense glacial and interglacial periods created large sea-level swings and moved shorelines dramatically. The tectonic uplift of the Appalachian mountains created lots of weathering, sequestration of CO₂, and with it, changes in climate and ocean chemistry.",
  "late devonian":
    "One of the 'Big Five' mass extinctions in Earth's history (360 million years ago). About 75% of species were lost. Cause: rapid growth and diversification of land plants generated rapid and severe global cooling.",
  "end permian":
    "One of the 'Big Five' mass extinctions in Earth's history (250 million years ago). About 96% of species were lost—the largest of the five. Cause: intense volcanic activity in Siberia caused global warming. Elevated CO₂ and sulfur (H₂S) levels from volcanoes caused ocean acidification, acid rain, and other changes in ocean and land chemistry.",
  "end triassic":
    "One of the 'Big Five' mass extinctions in Earth's history (200 million years ago). About 80% of species were lost. Cause: underwater volcanic activity in the Central Atlantic Magmatic Province (CAMP) caused global warming and a dramatic change in the chemical composition of the oceans.",
  "end cretaceous":
    "One of the 'Big Five' mass extinctions in Earth's history (65 million years ago). About 76% of species were lost. This event killed off the non-avian dinosaurs. Cause: asteroid impact in Yucatán, Mexico, causing a global cataclysm and rapid cooling. Some changes may have already pre-dated this asteroid, with intense volcanic activity and tectonic uplift.",
};

function normalizeForMatch(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findEpaDefinition(title: string): string | null {
  const n = normalizeForMatch(title);
  if (EPA_GLOSSARY[n]) return EPA_GLOSSARY[n];
  // Try without parentheticals, e.g. "General Circulation Model (GCM)" -> "general circulation model"
  const withoutParens = n.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  return EPA_GLOSSARY[withoutParens] ?? null;
}

function findBioregionDefinition(title: string): string | null {
  const n = normalizeForMatch(title);
  if (BIOREGION_GLOSSARY[n]) return BIOREGION_GLOSSARY[n];
  const withoutParens = n.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (BIOREGION_GLOSSARY[withoutParens]) return BIOREGION_GLOSSARY[withoutParens];
  // Match "area of endemism (aoe)" -> "area of endemism"
  const baseName = n.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return BIOREGION_GLOSSARY[baseName] ?? null;
}

function findOneEarthBiomeDefinition(title: string): string | null {
  const n = normalizeForMatch(title);
  if (ONE_EARTH_BIOMES[n]) return ONE_EARTH_BIOMES[n];
  const withoutParens = n.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (ONE_EARTH_BIOMES[withoutParens]) return ONE_EARTH_BIOMES[withoutParens];
  const baseName = n.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return ONE_EARTH_BIOMES[baseName] ?? null;
}

function findOwidMassExtinctionDefinition(title: string): string | null {
  const n = normalizeForMatch(title);
  if (OWID_MASS_EXTINCTIONS[n]) return OWID_MASS_EXTINCTIONS[n];
  const baseName = n.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return OWID_MASS_EXTINCTIONS[baseName] ?? null;
}

/** Convert EPA glossary key to display title (e.g. "carbon dioxide" -> "Carbon dioxide") */
function epaKeyToTitle(key: string): string {
  return key
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower.startsWith("(") && lower.endsWith(")")) {
        return word; // keep (led) as-is or uppercase
      }
      if (/^[a-z]/.test(word)) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      return word;
    })
    .join(" ")
    .replace(/\(([a-z]+)\)/gi, (_, acr) => `(${acr.toUpperCase()})`);
}

/** All term titles to seed: union of EPA glossary + your previous list (deduplicated by normalized title). */
function getAllTermTitles(): string[] {
  const epaTitles = Object.keys(EPA_GLOSSARY).map(epaKeyToTitle);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of TERM_TITLES) {
    const n = normalizeForMatch(t);
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(t);
  }
  for (const t of epaTitles) {
    const n = normalizeForMatch(t);
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(t);
  }
  return out;
}

async function ensureLevelTags(
  prisma: PrismaClient
): Promise<{ kids: { id: string }; medium: { id: string }; scientific: { id: string } }> {
  const levelTagSpecs = [
    { slug: "kids-definition", title: "Kids definition", kind: TagKind.LEVEL },
    { slug: "medium-definition", title: "Medium definition", kind: TagKind.LEVEL },
    { slug: "scientific-definition", title: "Scientific definition", kind: TagKind.LEVEL },
  ] as const;
  const result = { kids: { id: "" }, medium: { id: "" }, scientific: { id: "" } };
  for (let i = 0; i < levelTagSpecs.length; i++) {
    const spec = levelTagSpecs[i];
    let tag = await prisma.tag.findFirst({ where: { slug: spec.slug } });
    if (!tag) {
      tag = await prisma.tag.create({
        data: { title: spec.title, slug: spec.slug, kind: spec.kind, published: true },
      });
    }
    if (i === 0) result.kids.id = tag.id;
    else if (i === 1) result.medium.id = tag.id;
    else result.scientific.id = tag.id;
  }
  return result;
}

// Extended list of terms (optional; many don't have EPA definitions yet)
const TERM_TITLES = [
  "1.5ºC",
  "100-Year Flood Levels",
  "Adaptive Capacity",
  "Adaptation",
  "Albedo",
  "Aerosols",
  "Alternative Energy",
  "Afforestation",
  "Atmosphere",
  "Atmospheric Lifetime",
  "Additionality",
  "Action for Climate Empowerment",
  "Accreditation",
  "Biomass",
  "BCR",
  "Bali Road Map",
  "Biofuels",
  "Borehole",
  "Carbon Insetting",
  "Carbon Dioxide",
  "Carbon Capture and Sequestration",
  "Coalbed Methane",
  "Carbon Dioxide Equivalent",
  "Concentration",
  "Carbonisation",
  "Coal Mine Methane",
  "Climate Feedback",
  "Climate System (or Earth System)",
  "Co-Benefit",
  "Climate Model",
  "Climate Change",
  "Carbon Sequestration",
  "Carbon Cycle",
  "Coral Bleaching",
  "Copenhagen Accord",
  "Climate governance",
  "Convention on Long-Range Transboundary Air Pollution",
  "CDR",
  "Climate Sensitivity",
  "Climate Lag",
  "Climate",
  "Chlorofluorocarbons",
  "Carbon Footprint",
  "Clean Development Mechanism",
  "Carbolysis",
  "Dryland Farming",
  "Durability",
  "Desertification",
  "Deforestation",
  "District Heating",
  "Eccentricity",
  "Evapotranspiration",
  "Enhanced Greenhouse Effect",
  "Emission Reduction Unit",
  "Exothermic",
  "ENERGY STAR",
  "Emissions Factor",
  "El Niño - Southern Oscillation (ENSO)",
  "Enteric Fermentation",
  "Energy Efficiency",
  "Emissions",
  "Environmental Integrity Group",
  "Enhanced Transparency Framework",
  "Earth Summit",
  "Fluorinated Gases",
  "Feedstock",
  "Fossil Fuel",
  "Fluorocarbons",
  "Feedback Mechanisms",
  "Fuel Switching",
  "Forcing Mechanism",
  "Greenhouse Effect",
  "Global Warming Potential",
  "GhG",
  "Global Warming",
  "Global Average Temperature",
  "Geosphere",
  "Glasgow Climate Pact",
  "Glacier",
  "Greenhouse Gas",
  "General Circulation Model (GCM)",
  "Habitat Fragmentation",
  "Halocarbons",
  "Hydrochlorofluorocarbons (HCFCs)",
  "Hydrocarbons",
  "Heat Waves",
  "Heat Island",
  "H/Corg",
  "Hydrosphere",
  "Indirect Emissions",
  "Inter-American Institute for Global Change Research",
  "Kyoto Protocol",
  "Landsat 9",
  "Landsat 7",
  "Landsat 8",
  "LAGEOS",
  "MRV",
  "Megha-Tropiques",
  "Meteor-M No.1",
  "MetOp",
  "Meteosat 8",
  "Methane",
  "Majuro Declaration",
  "Megacities",
  "Malé Declaration on the Human Dimension of Global Climate Change",
  "Marrakech Accords",
  "Net Zero",
  "NigComSat-1",
  "NigComSat-1R",
  "NOAA-20",
  "NigeriaSat-2",
  "NOAA-19",
  "NOAA-18",
  "Nigerian weather and communications satellites",
  "Nigeriasat-1",
  "NOAA-15",
  "Nitrous oxide",
  "Nationally determined contribution",
  "Oceansat-2",
  "Orbiting Carbon Observatory 2",
  "Ocean Acidification",
  "Ozone Depleting Substance",
  "Photosynthesis",
  "Permanence",
  "Parts Per Million",
  "PRISMA (spacecraft)",
  "Pakistan Technology Evaluation Satellite",
  "PROBA-V",
  "Paz (satellite)",
  "Pléiades (satellite)",
  "Precautionary principle",
  "Radiative Forcing",
  "RASAT",
  "Rio Convention",
  "Resourcesat-1",
  "Resurs-P No.1",
  "Resurs-P No.2",
  "Reflectivity",
  "Resourcesat-2",
  "Radarsat-2",
  "Renewable Energy",
  "Reforestation",
  "Radiation",
  "Recycling",
  "Removal Units",
  "Scalability",
  "Sustainability Legislation",
  "Sulfur Hexafluoride",
  "Stability",
  "Soil Moisture and Ocean Salinity",
  "Solar Radiation and Climate Experiment",
  "Syngas",
  "Sentinel-2",
  "Sentinel-3",
  "Soil Moisture Active Passive",
  "Sentinel-5 Precursor",
  "Suomi NPP",
  "SARAL",
  "SAOCOM",
  "Sentinel-1",
  "Sentinel-6 Michael Freilich",
  "Supplementarity",
  "TIMED",
  "Terra (satellite)",
  "TanDEM-X",
  "Tars",
  "TerraSAR-X",
  "THEOS (satellite)",
  "Talanoa Dialogue",
  "Tom Rivett-Carnac",
  "Tropospheric Ozone",
  "Tundra",
  "United Nations REDD Programme",
  "Under2 Coalition",
  "United Nations Framework Convention on Climate Change",
  "Ultraviolet Radiation",
  "VRSS-1",
  "VNREDSat-1",
  "Vulnerability",
  "Wastewater",
  "Water Vapor",
  // Bioregion / biogeography (biotic and abiotic methods) — https://en.wikipedia.org/wiki/Bioregion
  "Area of Endemism (AoE)",
  "Biotic Province",
  "Biome",
  "Biotope (ecotope or habitat)",
  "Centre of Endemism",
  "Cenocron",
  "Chorotype",
  "Chronofauna (horofauna)",
  "Climate Zone",
  "Concrete Biota",
  "Cultural Area (cultural region)",
  "Domain",
  "Ecoregion",
  "Ecotone (ecoline)",
  "Ecozone",
  "Functional Group",
  "Generalized Track",
  "Landform",
  "Phytocorion (floristic province)",
  "Phytogeographic Region",
  "Realm",
  "Soil Zone",
  "Species Assemblage",
  "Watershed",
  "Zoogeographic Region",
  // One Earth Bioregions Framework (2023) — 14 major biome types — https://www.oneearth.org/bioregions-2023/
  "Boreal Forests/Taiga (medium blue)",
  "Deserts & Xeric Shrublands (rust)",
  "Flooded Grasslands & Savannas (light blue)",
  "Mangroves (pink)",
  "Mediterranean Forests, Woodlands & Scrub (red)",
  "Mountain Grasslands & Shrublands (beige)",
  "Temperate Broadleaf & Mixed Forests (dark green)",
  "Temperate Conifer Forests (grey-green)",
  "Temperate Grasslands, Savannas & Shrublands (yellow)",
  "Tropical & Subtropical Coniferous Forests (light green)",
  "Tropical & Subtropical Dry Broadleaf Forests (olive green)",
  "Tropical & Subtropical Grasslands, Savannas & Shrublands (orange)",
  "Tropical & Subtropical Moist Broadleaf Forests (bright green)",
  "Tundra (teal)",
  // NASA Earth-related missions — https://www.nasa.gov/a-to-z-of-nasa-missions/
  "ACT-America (Atmospheric Carbon and Transport – America)",
  "ADEOS / Midori (Advanced Earth Observing Satellite)",
  "Aqua",
  "Aquarius",
  "ARCTAS (Arctic Research of the Composition of the Troposphere from Aircraft and Satellites)",
  "Aura",
  "CALIPSO (Cloud-Aerosol Lidar and Infrared Pathfinder Satellite)",
  "CARVE (Carbon in Arctic Reservoirs Vulnerability Experiment)",
  "CATS (Cloud-Aerosol Transport System)",
  "CloudSat",
  "CYGNSS (Cyclone Global Navigation Satellite System)",
  "DISCOVER AQ (Deriving Information on Surface Conditions from COlumn and VERtically Resolved Observations Relevant to Air Quality)",
  "DSCOVR (Deep Space Climate Observatory)",
  "ECOSTRESS (ECOsystem Spaceborne Thermal Radiometer Experiment on Space Station)",
  "EMIT (Earth Surface Mineral Dust Source Investigation)",
  "EO-1 (Earth Observing-1)",
  "ERBS (Earth Radiation Budget Satellite)",
  "ESSA (Environmental Sciences Services Administration)",
  "GEDI (Global Ecosystem Dynamics Investigation)",
  "Geosat (U.S. Navy GEOdetic SATellite)",
  "Glory",
  "GOES Satellite Network",
  "GOES-U",
  "GPM (Global Precipitation Measurement)",
  "GRACE (Gravity Recovery And Climate Experiment)",
  "GRACE-FO (Gravity Recovery and Climate Experiment Follow-on)",
  "IceBridge",
  "ICESat (Ice, Clouds and Land Elevation Satellite)",
  "ICESat-2 (Ice, Clouds and Land Elevation Satellite 2)",
  "INCUS (Investigation of Convective Updrafts)",
  "Jason-1",
  "Jason-3",
  "Jason-CS (Jason Continuity of Service/Sentinel-6)",
  "JPSS (Joint Polar Satellite System)",
  "MAIA (Multi-Angle Imager for Aerosols)",
  "NAAMES (North Atlantic Aerosols and Marine Ecosystems Study)",
  "NISAR (NASA-ISRO Synthetic Aperture Radar)",
  "Nimbus",
  "OCO (Orbiting Carbon Observatory)",
  "OCO-2 (Orbiting Carbon Observatory-2)",
  "OCO-3 (Orbiting Carbon Observatory-3)",
  "OMG (Oceans Melting Greenland)",
  "ORACLES (ObseRvations of Aerosols above CLouds and their IntEractionS)",
  "PACE (Plankton, Aerosol, Cloud, Ocean Ecosystem)",
  "PREFIRE (Polar Radiant Energy in the Far-InfraRed Experiment)",
  "QuikSCAT (Quick Scatterometer)",
  "RADARSAT-1 (Radar Satellite-1)",
  "RapidScat (ISS-RapidScat)",
  "SAGE III (Stratospheric Aerosol and Gas Experiment III)",
  "SEAC4RS (Studies of Emissions, Atmospheric Composition, Clouds and Climate Coupling by Regional Surveys)",
  "Seasat 1",
  "SeaWiFS (Sea-viewing Wide Field-of-view Sensor)",
  "SWOT (Surface Water and Ocean Topography)",
  "TEMPO (Tropospheric Emissions: Monitoring of POllution)",
  "TOPEX/Poseidon",
  "TRMM (Tropical Rainfall Measuring Mission)",
  "TROPICS (Time-Resolved Observations of Precipitation structure and storm Intensity with a Constellation of Smallsats)",
  "TSIS-1 (Total and Spectral Solar Irradiance Sensor)",
  "TSIS-2 (Total and Spectral Solar Irradiance Sensor)",
  "UARS (Upper Atmosphere Research Satellite)",
  // Our World in Data — "Big Five" mass extinctions — https://ourworldindata.org/mass-extinctions
  "End Cretaceous",
  "End Ordovician",
  "End Permian",
  "End Triassic",
  "Late Devonian",
];

async function main() {
  // Upsert EPA source
  let epaSource = await prisma.source.findFirst({
    where: { href: EPA_GLOSSARY_URL },
  });
  if (!epaSource) {
    epaSource = await prisma.source.create({
      data: {
        title: EPA_SOURCE_TITLE,
        href: EPA_GLOSSARY_URL,
        published: true,
      },
    });
    console.log("Created EPA glossary source.");
  }

  // Upsert Wikipedia Bioregion source (scientific definitions)
  let bioregionSource = await prisma.source.findFirst({
    where: { href: BIOREGION_GLOSSARY_URL },
  });
  if (!bioregionSource) {
    bioregionSource = await prisma.source.create({
      data: {
        title: "Bioregion – Wikipedia",
        href: BIOREGION_GLOSSARY_URL,
        published: true,
      },
    });
    console.log("Created Wikipedia Bioregion source.");
  }

  // Upsert One Earth Bioregions Framework source (scientific definitions for 14 biomes)
  let oneEarthSource = await prisma.source.findFirst({
    where: { href: ONE_EARTH_BIOREGIONS_URL },
  });
  if (!oneEarthSource) {
    oneEarthSource = await prisma.source.create({
      data: {
        title: "One Earth Bioregions Framework",
        href: ONE_EARTH_BIOREGIONS_URL,
        published: true,
      },
    });
    console.log("Created One Earth Bioregions source.");
  }

  // Upsert Our World in Data source (medium definitions for mass extinctions)
  let owidSource = await prisma.source.findFirst({
    where: { href: OWID_MASS_EXTINCTIONS_URL },
  });
  if (!owidSource) {
    owidSource = await prisma.source.create({
      data: {
        title: "There have been five mass extinctions in Earth's history – Our World in Data",
        href: OWID_MASS_EXTINCTIONS_URL,
        published: true,
      },
    });
    console.log("Created Our World in Data source.");
  }

  // Level tags for filtering: "Kids definition", "Medium definition", "Scientific definition"
  const levelTags = await ensureLevelTags(prisma);

  // Seed all terms: EPA kids; medium from Our World in Data (mass extinctions); scientific from One Earth or Wikipedia Bioregion.
  const allTitles = getAllTermTitles();
  let created = 0;
  let updated = 0;
  for (const title of allTitles) {
    const definitionKids = findEpaDefinition(title);
    const definitionMedium = findOwidMassExtinctionDefinition(title);
    const definitionScientificOneEarth = findOneEarthBiomeDefinition(title);
    const definitionScientificBioregion = findBioregionDefinition(title);
    const definitionScientific = definitionScientificOneEarth ?? definitionScientificBioregion;
    const scientificSourceId = definitionScientificOneEarth
      ? oneEarthSource.id
      : definitionScientificBioregion
        ? bioregionSource.id
        : null;
    const termData = {
      title,
      published: true,
      sourceId: epaSource.id,
      definitionKids: definitionKids ?? undefined,
      definitionMedium: definitionMedium ?? undefined,
      definitionScientific: definitionScientific ?? undefined,
      content: definitionKids ?? definitionMedium ?? definitionScientific ?? undefined,
    };

    const existing = await prisma.term.findFirst({
      where: { title },
    });

    let termId: string;
    if (existing) {
      await prisma.term.update({
        where: { id: existing.id },
        data: {
          definitionKids: termData.definitionKids ?? existing.definitionKids,
          definitionMedium: termData.definitionMedium ?? existing.definitionMedium,
          definitionScientific:
            termData.definitionScientific ?? existing.definitionScientific,
          content: termData.content ?? existing.content,
        },
      });
      termId = existing.id;
      updated++;
    } else {
      const createdTerm = await prisma.term.create({
        data: termData,
      });
      termId = createdTerm.id;
      created++;
    }

    // Record definition in history with source + provenance (government source: EPA)
    if (definitionKids) {
      const latest = await prisma.termDefinition.findFirst({
        where: { termId, level: DefinitionLevel.kids },
        orderBy: { createdAt: "desc" },
      });
      if (!latest || latest.content !== definitionKids) {
        await prisma.termDefinition.create({
          data: {
            termId,
            level: DefinitionLevel.kids,
            content: definitionKids,
            sourceId: epaSource.id,
            provenance: DefinitionProvenance.GOVERNMENT,
          },
        });
      }
    }

    // Record medium definition from Our World in Data (mass extinctions)
    if (definitionMedium) {
      const latest = await prisma.termDefinition.findFirst({
        where: { termId, level: DefinitionLevel.medium },
        orderBy: { createdAt: "desc" },
      });
      if (!latest || latest.content !== definitionMedium) {
        await prisma.termDefinition.create({
          data: {
            termId,
            level: DefinitionLevel.medium,
            content: definitionMedium,
            sourceId: owidSource.id,
            provenance: DefinitionProvenance.SCRAPED,
          },
        });
      }
    }

    // Record scientific definition (One Earth biomes preferred, else Wikipedia Bioregion)
    if (definitionScientific && scientificSourceId) {
      const latest = await prisma.termDefinition.findFirst({
        where: { termId, level: DefinitionLevel.scientific },
        orderBy: { createdAt: "desc" },
      });
      if (!latest || latest.content !== definitionScientific) {
        await prisma.termDefinition.create({
          data: {
            termId,
            level: DefinitionLevel.scientific,
            content: definitionScientific,
            sourceId: scientificSourceId,
            provenance: DefinitionProvenance.SCRAPED,
          },
        });
      }
    }
  }

  // Sync level tags: add Kids/Medium/Scientific tag to each term that has that definition
  const allTerms = await prisma.term.findMany({
    where: { published: true },
    select: {
      id: true,
      definitionKids: true,
      definitionMedium: true,
      definitionScientific: true,
    },
  });
  for (const term of allTerms) {
    if (term.definitionKids?.trim())
      await prisma.termTag.upsert({
        where: { termId_tagId: { termId: term.id, tagId: levelTags.kids.id } },
        create: { termId: term.id, tagId: levelTags.kids.id },
        update: {},
      });
    if (term.definitionMedium?.trim())
      await prisma.termTag.upsert({
        where: { termId_tagId: { termId: term.id, tagId: levelTags.medium.id } },
        create: { termId: term.id, tagId: levelTags.medium.id },
        update: {},
      });
    if (term.definitionScientific?.trim())
      await prisma.termTag.upsert({
        where: { termId_tagId: { termId: term.id, tagId: levelTags.scientific.id } },
        create: { termId: term.id, tagId: levelTags.scientific.id },
        update: {},
      });
  }

  // Published languages power the /{locale} pages and on-demand term
  // translation (?locale= on term pages). English is the default site
  // language, so it gets no Language row.
  const LANGUAGES: { title: string; i18n: string }[] = [
    { title: "Español", i18n: "es" },
    { title: "Français", i18n: "fr" },
    { title: "Português", i18n: "pt" },
    { title: "हिन्दी", i18n: "hi" },
    { title: "中文", i18n: "zh" },
    { title: "العربية", i18n: "ar" },
  ];
  for (const lang of LANGUAGES) {
    const existingLang = await prisma.language.findFirst({
      where: { i18n: lang.i18n },
    });
    if (!existingLang) {
      await prisma.language.create({
        data: { title: lang.title, i18n: lang.i18n, published: true },
      });
    } else if (!existingLang.published) {
      await prisma.language.update({
        where: { id: existingLang.id },
        data: { published: true },
      });
    }
  }

  console.log(
    `Seed complete. Created ${created} terms, updated ${updated} terms, ${LANGUAGES.length} languages ensured. EPA kids, Our World in Data medium (mass extinctions), and Wikipedia/One Earth scientific definitions recorded in definition history.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
