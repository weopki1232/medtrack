const DEFAULT_SUBJECTS = [
  { id:'alevel_bio', name:'A-Level Biology', shortName:'Biology', color:'#10b981', icon:'🧬', targetHours:120, priority:'high', examDate:'2027-03-13',
    topics:[{id:'bio_01',name:'Ecosystems & Biomes'},{id:'bio_02',name:'Populations & Natural Resources'},{id:'bio_03',name:'Biodiversity & Taxonomy'},{id:'bio_04',name:'Cell Biochemistry'},{id:'bio_05',name:'Cell Structure & Function'},{id:'bio_06',name:'Digestive System'},{id:'bio_07',name:'Circulatory System'},{id:'bio_08',name:'Lymphatic & Immune System'},{id:'bio_09',name:'Excretory System'},{id:'bio_10',name:'Respiratory System'},{id:'bio_11',name:'Nervous System & Movement'},{id:'bio_12',name:'Reproductive System'},{id:'bio_13',name:'Endocrine System'},{id:'bio_14',name:'Animal Behavior'},{id:'bio_15',name:'Plant Tissues & Structure'},{id:'bio_16',name:'Photosynthesis'},{id:'bio_17',name:'Plant Reproduction'},{id:'bio_18',name:'Plant Growth & Response'},{id:'bio_19',name:'Mendelian Genetics'},{id:'bio_20',name:'DNA & Protein Synthesis'},{id:'bio_21',name:'Genetic Mutations'},{id:'bio_22',name:'Biotechnology & DNA Tech'},{id:'bio_23',name:'Evolution & Population Genetics'}]},
  { id:'alevel_chem', name:'A-Level Chemistry', shortName:'Chemistry', color:'#f59e0b', icon:'⚗️', targetHours:150, priority:'critical', examDate:'2027-03-14',
    topics:[{id:'chem_01',name:'Atomic Structure & Periodic Trends'},{id:'chem_02',name:'Chemical Bonding'},{id:'chem_03',name:'Gases'},{id:'chem_04',name:'Organic Chemistry'},{id:'chem_05',name:'Polymers'},{id:'chem_06',name:'Stoichiometry & Mole Calculations'},{id:'chem_07',name:'Reaction Rates'},{id:'chem_08',name:'Chemical Equilibrium'},{id:'chem_09',name:'Acid-Base Chemistry'},{id:'chem_10',name:'Electrochemistry'},{id:'chem_11',name:'Lab Safety & Techniques'},{id:'chem_12',name:'Solutions & Concentrations'}]},
  { id:'alevel_phys', name:'A-Level Physics', shortName:'Physics', color:'#6366f1', icon:'⚡', targetHours:140, priority:'critical', examDate:'2027-03-13',
    topics:[{id:'phys_01',name:'Kinematics (Linear Motion)'},{id:'phys_02',name:"Forces & Newton's Laws"},{id:'phys_03',name:'Equilibrium of Objects'},{id:'phys_04',name:'Work, Energy & Conservation'},{id:'phys_05',name:'Momentum & Collisions'},{id:'phys_06',name:'Circular Motion & Projectiles'},{id:'phys_07',name:'Simple Harmonic Motion (SHM)'},{id:'phys_08',name:'Waves'},{id:'phys_09',name:'Sound'},{id:'phys_10',name:'Light & Optics'},{id:'phys_11',name:'Electrostatics'},{id:'phys_12',name:'Current Electricity & Circuits'},{id:'phys_13',name:'Magnetism & Electromagnetic Induction'},{id:'phys_14',name:'Electromagnetic Waves'},{id:'phys_15',name:'Heat, Temperature & Gases'},{id:'phys_16',name:'Solids & Fluids'},{id:'phys_17',name:'Atomic Physics'},{id:'phys_18',name:'Nuclear & Particle Physics'}]},
  { id:'alevel_math1', name:'A-Level Math 1', shortName:'Math 1', color:'#8b5cf6', icon:'📐', targetHours:150, priority:'critical', examDate:'2027-03-14',
    topics:[{id:'math_01',name:'Sets & Logic'},{id:'math_02',name:'Real Numbers & Polynomials'},{id:'math_03',name:'Functions'},{id:'math_04',name:'Exponential & Logarithmic Functions'},{id:'math_05',name:'Trigonometric Functions'},{id:'math_06',name:'Complex Numbers'},{id:'math_07',name:'Matrices'},{id:'math_08',name:'Sequences & Series'},{id:'math_09',name:'Analytical Geometry'},{id:'math_10',name:'3D Vectors'},{id:'math_11',name:'Statistics'},{id:'math_12',name:'Probability Distributions'},{id:'math_13',name:'Counting Principles'},{id:'math_14',name:'Probability'},{id:'math_15',name:'Calculus (Derivatives)'},{id:'math_16',name:'Calculus (Integration)'},{id:'math_17',name:'Financial Math / Tax'}]},
  { id:'alevel_eng', name:'A-Level English', shortName:'English', color:'#06b6d4', icon:'📖', targetHours:80, priority:'medium', examDate:'2027-03-14',
    topics:[{id:'eng_01',name:'Short Conversations (Listening)'},{id:'eng_02',name:'Long Conversations (Listening)'},{id:'eng_03',name:'Advertisements (Reading)'},{id:'eng_04',name:'Product/Service Reviews (Reading)'},{id:'eng_05',name:'News Reports (Reading)'},{id:'eng_06',name:'Visual Texts - Graphs/Charts'},{id:'eng_07',name:'General Articles 500-600 words'},{id:'eng_08',name:'Text Completion (Writing)'},{id:'eng_09',name:'Paragraph Organization (Writing)'}]},
  { id:'alevel_thai', name:'A-Level Thai', shortName:'Thai', color:'#ec4899', icon:'🇹🇭', targetHours:60, priority:'medium', examDate:'2027-03-13',
    topics:[{id:'thai_01',name:'Reading Comprehension'},{id:'thai_02',name:'Inference & Analysis'},{id:'thai_03',name:"Author's Purpose & Tone"},{id:'thai_04',name:'Paragraph & Essay Writing'},{id:'thai_05',name:'Argument & Persuasion'},{id:'thai_06',name:'Speech & Listening Analysis'},{id:'thai_07',name:'Spelling & Vocabulary'},{id:'thai_08',name:'Grammar & Sentence Structure'},{id:'thai_09',name:'Formal Language (Rajasat)'}]},
  { id:'alevel_social', name:'A-Level Social Studies', shortName:'Social', color:'#f97316', icon:'🌏', targetHours:60, priority:'medium', examDate:'2027-03-13',
    topics:[{id:'soc_01',name:'Buddhism & Religious Ethics'},{id:'soc_02',name:'Civics & Democratic Values'},{id:'soc_03',name:'Thai Political System'},{id:'soc_04',name:'Economics & Sufficiency Economy'},{id:'soc_05',name:'Global Economic Relations'},{id:'soc_06',name:'Thai History'},{id:'soc_07',name:'World History'},{id:'soc_08',name:'Physical Geography'},{id:'soc_09',name:'Human-Environment Interaction'}]},
  { id:'tgat1', name:'TGAT1 - English Communication', shortName:'TGAT1', color:'#14b8a6', icon:'💬', targetHours:40, priority:'medium', examDate:'2027-01-30',
    topics:[{id:'tg1_01',name:'Q&A (Question-Response)'},{id:'tg1_02',name:'Short Conversations'},{id:'tg1_03',name:'Long Conversations'},{id:'tg1_04',name:'Text Completion'},{id:'tg1_05',name:'Reading Comprehension'}]},
  { id:'tgat2', name:'TGAT2 - Critical Thinking', shortName:'TGAT2', color:'#a855f7', icon:'🧠', targetHours:30, priority:'medium', examDate:'2027-01-30',
    topics:[{id:'tg2_01',name:'Thai Language Ability'},{id:'tg2_02',name:'Numerical Ability'},{id:'tg2_03',name:'Spatial Relations'},{id:'tg2_04',name:'Logical Reasoning'}]},
  { id:'tpat1', name:'TPAT1 - Medical Aptitude', shortName:'TPAT1', color:'#ef4444', icon:'🩺', targetHours:80, priority:'critical', examDate:'2027-02-13',
    topics:[{id:'tp1_01',name:'Scientific Reasoning'},{id:'tp1_02',name:'Biology Applications'},{id:'tp1_03',name:'Chemistry Applications'},{id:'tp1_04',name:'Physics Applications'},{id:'tp1_05',name:'Math Applications'},{id:'tp1_06',name:'Critical Analysis'},{id:'tp1_07',name:'Past Papers Practice'}]},
];

const TOPIC_NAMES_TH = {
  // Biology
  bio_01:'ระบบนิเวศและไบโอม', bio_02:'ประชากรและทรัพยากรธรรมชาติ', bio_03:'ความหลากหลายทางชีวภาพและอนุกรมวิธาน',
  bio_04:'ชีวเคมีของเซลล์', bio_05:'โครงสร้างและหน้าที่ของเซลล์', bio_06:'ระบบย่อยอาหาร',
  bio_07:'ระบบหมุนเวียนโลหิต', bio_08:'ระบบน้ำเหลืองและภูมิคุ้มกัน', bio_09:'ระบบขับถ่าย',
  bio_10:'ระบบหายใจ', bio_11:'ระบบประสาทและการเคลื่อนไหว', bio_12:'ระบบสืบพันธุ์',
  bio_13:'ระบบต่อมไร้ท่อ', bio_14:'พฤติกรรมสัตว์', bio_15:'เนื้อเยื่อและโครงสร้างพืช',
  bio_16:'การสังเคราะห์ด้วยแสง', bio_17:'การสืบพันธุ์ของพืช', bio_18:'การเจริญเติบโตและการตอบสนองของพืช',
  bio_19:'พันธุศาสตร์เมนเดล', bio_20:'DNA และการสังเคราะห์โปรตีน', bio_21:'การกลายพันธุ์ทางพันธุกรรม',
  bio_22:'เทคโนโลยีชีวภาพและเทคโนโลยี DNA', bio_23:'วิวัฒนาการและพันธุศาสตร์ประชากร',
  // Chemistry
  chem_01:'โครงสร้างอะตอมและแนวโน้มตารางธาตุ', chem_02:'พันธะเคมี', chem_03:'แก๊ส',
  chem_04:'เคมีอินทรีย์', chem_05:'พอลิเมอร์', chem_06:'สมมาตรเคมีและการคำนวณโมล',
  chem_07:'อัตราการเกิดปฏิกิริยา', chem_08:'สมดุลเคมี', chem_09:'เคมีกรด-เบส',
  chem_10:'เคมีไฟฟ้า', chem_11:'ความปลอดภัยและเทคนิคในห้องปฏิบัติการ', chem_12:'สารละลายและความเข้มข้น',
  // Physics
  phys_01:'จลนศาสตร์ (การเคลื่อนที่เชิงเส้น)', phys_02:'แรงและกฎของนิวตัน', phys_03:'สมดุลของวัตถุ',
  phys_04:'งาน พลังงาน และการอนุรักษ์', phys_05:'โมเมนตัมและการชน', phys_06:'การเคลื่อนที่แบบวงกลมและโพรเจกไทล์',
  phys_07:'การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย', phys_08:'คลื่น', phys_09:'เสียง',
  phys_10:'แสงและทัศนศาสตร์', phys_11:'ไฟฟ้าสถิต', phys_12:'ไฟฟ้ากระแสและวงจรไฟฟ้า',
  phys_13:'แม่เหล็กและการเหนี่ยวนำแม่เหล็กไฟฟ้า', phys_14:'คลื่นแม่เหล็กไฟฟ้า',
  phys_15:'ความร้อน อุณหภูมิ และแก๊ส', phys_16:'ของแข็งและของไหล',
  phys_17:'ฟิสิกส์อะตอม', phys_18:'ฟิสิกส์นิวเคลียร์และอนุภาค',
  // Math 1
  math_01:'เซตและตรรกศาสตร์', math_02:'จำนวนจริงและพหุนาม', math_03:'ฟังก์ชัน',
  math_04:'ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม', math_05:'ฟังก์ชันตรีโกณมิติ', math_06:'จำนวนเชิงซ้อน',
  math_07:'เมทริกซ์', math_08:'ลำดับและอนุกรม', math_09:'เรขาคณิตเชิงวิเคราะห์',
  math_10:'เวกเตอร์สามมิติ', math_11:'สถิติ', math_12:'การแจกแจงความน่าจะเป็น',
  math_13:'หลักการนับ', math_14:'ความน่าจะเป็น', math_15:'แคลคูลัส (อนุพันธ์)',
  math_16:'แคลคูลัส (อินทิเกรชัน)', math_17:'คณิตศาสตร์การเงินและภาษี',
  // English
  eng_01:'การสนทนาสั้น (ฟัง)', eng_02:'การสนทนายาว (ฟัง)', eng_03:'โฆษณา (อ่าน)',
  eng_04:'รีวิวสินค้า/บริการ (อ่าน)', eng_05:'รายงานข่าว (อ่าน)', eng_06:'ข้อความภาพ - กราฟ/แผนภูมิ',
  eng_07:'บทความทั่วไป 500-600 คำ', eng_08:'เติมข้อความ (เขียน)', eng_09:'การจัดระเบียบย่อหน้า (เขียน)',
  // Thai
  thai_01:'การอ่านจับใจความ', thai_02:'การอนุมานและวิเคราะห์', thai_03:'จุดประสงค์และน้ำเสียงผู้เขียน',
  thai_04:'การเขียนย่อหน้าและเรียงความ', thai_05:'การโต้แย้งและการโน้มน้าว',
  thai_06:'การวิเคราะห์การพูดและการฟัง', thai_07:'การสะกดและคำศัพท์',
  thai_08:'ไวยากรณ์และโครงสร้างประโยค', thai_09:'ภาษาราชาศัพท์',
  // Social Studies
  soc_01:'พุทธศาสนาและจริยธรรมทางศาสนา', soc_02:'หน้าที่พลเมืองและค่านิยมประชาธิปไตย',
  soc_03:'ระบบการเมืองไทย', soc_04:'เศรษฐศาสตร์และเศรษฐกิจพอเพียง',
  soc_05:'ความสัมพันธ์เศรษฐกิจโลก', soc_06:'ประวัติศาสตร์ไทย',
  soc_07:'ประวัติศาสตร์โลก', soc_08:'ภูมิศาสตร์กายภาพ', soc_09:'ปฏิสัมพันธ์มนุษย์กับสิ่งแวดล้อม',
  // TGAT1
  tg1_01:'ถาม-ตอบ', tg1_02:'การสนทนาสั้น', tg1_03:'การสนทนายาว',
  tg1_04:'เติมข้อความ', tg1_05:'การอ่านจับใจความ',
  // TGAT2
  tg2_01:'ความสามารถทางภาษาไทย', tg2_02:'ความสามารถทางตัวเลข',
  tg2_03:'มิติสัมพันธ์', tg2_04:'การใช้เหตุผลเชิงตรรกะ',
  // TPAT1
  tp1_01:'การใช้เหตุผลทางวิทยาศาสตร์', tp1_02:'การประยุกต์ใช้ชีววิทยา',
  tp1_03:'การประยุกต์ใช้เคมี', tp1_04:'การประยุกต์ใช้ฟิสิกส์',
  tp1_05:'การประยุกต์ใช้คณิตศาสตร์', tp1_06:'การวิเคราะห์เชิงวิจารณ์', tp1_07:'ฝึกข้อสอบเก่า',
};
function tTopic(id, fallback) {
  var lang = Storage.getSettings ? (Storage.getSettings().lang || 'en') : 'en';
  return (lang === 'th' && TOPIC_NAMES_TH[id]) ? TOPIC_NAMES_TH[id] : fallback;
}

const POMODORO_PRESETS = [
  { label:'25 / 5',  work:25, shortBreak:5,  longBreak:15, cycles:4 },
  { label:'50 / 10', work:50, shortBreak:10, longBreak:20, cycles:4 },
  { label:'45 / 15', work:45, shortBreak:15, longBreak:30, cycles:4 },
];

