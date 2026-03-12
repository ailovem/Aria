export const COMMON_DRUG_QUICK_QUERIES = [
    '二甲双胍',
    '氨氯地平',
    '缬沙坦',
    '阿托伐他汀',
    '阿司匹林'
];

export const MEDICAL_VISIT_CHECKLIST = [
    '当前服药清单：药名、剂量、频次、开始时间。',
    '既往过敏史和曾经出现过的不良反应。',
    '最近 1 到 2 周的家庭监测记录，例如血压、血糖、体重。',
    '最近出现的不适症状、发生时间、持续时长和诱因。',
    '最近的化验单、出院记录、复诊建议或医生调整说明。'
];

export const FREE_OFFICIAL_SOURCES = [
    {
        label: 'OpenFDA 标签库',
        url: 'https://open.fda.gov/apis/drug/label/'
    },
    {
        label: 'DailyMed 官方药品信息',
        url: 'https://dailymed.nlm.nih.gov/dailymed/app-support-web-services.cfm'
    },
    {
        label: 'RxNorm / RxNav',
        url: 'https://lhncbc.nlm.nih.gov/RxNav/APIs/'
    },
    {
        label: 'MedlinePlus Connect',
        url: 'https://medlineplus.gov/connect/overview.html'
    }
];

export const CHRONIC_GUIDES = [
    {
        id: 'hypertension',
        name: '高血压管理',
        tag: '血压监测',
        summary: '重点是固定时段记录家庭血压、按医嘱长期服药、少盐规律活动，不要因为“今天正常”就自行停药。',
        focus: [
            '在相对固定的时间监测血压并记录，复诊时把数值带给医生看趋势。',
            '如果服药后出现明显头晕、乏力、心率异常或跌倒风险，应尽快联系医生评估。',
            '控制盐摄入，配合体重、睡眠和活动管理，比单次量血压更能帮助长期控制。'
        ],
        askDoctor: [
            '这款降压药是长期维持，还是这次阶段性调整？',
            '如果漏服、血压波动或感到头晕，我应该怎么处理？',
            '我是否需要定期复查肾功能、电解质或心率？'
        ],
        redFlags: [
            '血压很高并伴胸痛、呼吸困难、意识变化、肢体无力时，应立即就医。',
            '持续头晕、反复跌倒、晕厥或严重乏力，需要尽快联系医生。'
        ],
        keywords: ['氨氯地平', '缬沙坦', '氯沙坦', '硝苯地平', 'amlodipine', 'valsartan', 'losartan', 'nifedipine'],
        learnMore: [
            {
                label: 'NHLBI：高血压',
                url: 'https://www.nhlbi.nih.gov/health/high-blood-pressure'
            },
            {
                label: 'MedlinePlus：高血压',
                url: 'https://medlineplus.gov/highbloodpressure.html'
            }
        ]
    },
    {
        id: 'diabetes',
        name: '2 型糖尿病管理',
        tag: '血糖与生活方式',
        summary: '长期管理要围绕血糖监测、规律服药、饮食结构、活动量和足部护理，不要只在“血糖高时”才关注。',
        focus: [
            '按医生建议记录空腹或餐后血糖，观察趋势比单次结果更重要。',
            '规律进食、控制精制糖和总热量、增加步行等活动，有助于药物和生活方式共同起效。',
            '关注低血糖表现、视力变化、足部伤口和麻木感，出现异常尽快沟通。'
        ],
        askDoctor: [
            '我需要重点盯空腹血糖、餐后血糖，还是糖化血红蛋白？',
            '如果食量变化、生病、出差或活动量增加，用药和监测要怎么调整？',
            '我是否需要做足部、眼底、肾功能等并发症筛查？'
        ],
        redFlags: [
            '出现意识模糊、大汗、心慌、明显乏力等疑似低血糖表现，需要尽快处理并联系医生。',
            '持续高血糖伴呕吐、脱水、呼吸异常或感染迹象时，应尽快就医。'
        ],
        keywords: ['二甲双胍', '阿卡波糖', '格列美脲', 'metformin', 'acarbose', 'glimepiride', 'insulin'],
        learnMore: [
            {
                label: 'NIDDK：2 型糖尿病',
                url: 'https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/type-2-diabetes'
            },
            {
                label: 'MedlinePlus：糖尿病',
                url: 'https://medlineplus.gov/diabetes.html'
            }
        ]
    },
    {
        id: 'lipids',
        name: '高血脂管理',
        tag: '心血管风险',
        summary: '高血脂往往没有明显症状，关键是按复查计划看长期指标，并把饮食、运动和药物依从性一起抓。',
        focus: [
            '按复诊要求复查血脂，不要因为没症状就中断管理。',
            '减少反式脂肪和高饱和脂肪摄入，结合体重管理和规律运动。',
            '如果正在服用降脂药，出现不明原因肌肉酸痛、乏力或肝功能异常提示时要及时咨询医生。'
        ],
        askDoctor: [
            '我这次控制重点是 LDL、甘油三酯还是整体心血管风险？',
            '多久复查一次血脂和肝功能更合适？',
            '如果我同时还有高血压或糖尿病，用药上需要注意什么？'
        ],
        redFlags: [
            '突发胸痛、呼吸困难、说话含糊或肢体无力等，应按急症处理。',
            '服药后出现明显肌痛、深色尿或持续不适时，要尽快联系医生。'
        ],
        keywords: ['阿托伐他汀', '辛伐他汀', 'atorvastatin', 'simvastatin', 'rosuvastatin'],
        learnMore: [
            {
                label: 'MedlinePlus：高胆固醇',
                url: 'https://medlineplus.gov/highbloodcholesterol.html'
            },
            {
                label: 'NHLBI：血胆固醇',
                url: 'https://www.nhlbi.nih.gov/health/blood-cholesterol'
            }
        ]
    },
    {
        id: 'ckd',
        name: '慢性肾病管理',
        tag: '肾功能保护',
        summary: '慢性肾病管理要看肾功能趋势、血压、血糖和用药安全，任何加药、减药或止痛药长期使用都应先问医生。',
        focus: [
            '保留肾功能化验结果和尿检结果，关注趋势变化而不是只看一次异常。',
            '很多药物需要根据肾功能调整，尤其是止痛药、抗感染药和部分慢病药。',
            '同时管理好血压、血糖和水肿情况，有助于减缓进展。'
        ],
        askDoctor: [
            '我当前属于哪个阶段，多久复查一次肾功能和尿蛋白？',
            '我正在吃的药里，哪些需要根据肾功能调整？',
            '饮食上是否需要关注盐、蛋白质、钾或液体摄入？'
        ],
        redFlags: [
            '尿量明显减少、呼吸困难、明显水肿、持续恶心呕吐时，应尽快就医。',
            '服药后出现严重乏力、意识异常或心悸，也需要及时处理。'
        ],
        keywords: ['氯沙坦', '缬沙坦', '二甲双胍', 'losartan', 'valsartan', 'metformin', 'ibuprofen'],
        learnMore: [
            {
                label: 'NIDDK：慢性肾病',
                url: 'https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd'
            },
            {
                label: 'MedlinePlus：慢性肾病',
                url: 'https://medlineplus.gov/chronickidneydisease.html'
            }
        ]
    }
];

export const DRUG_REFERENCE_LIBRARY = [
    {
        id: 'atorvastatin',
        canonicalName: '阿托伐他汀',
        englishName: 'atorvastatin',
        category: '调脂药（他汀类）',
        aliases: ['阿托伐他汀', '阿托伐他汀钙', '立普妥', 'atorvastatin', 'lipitor'],
        apiSearchTerms: ['atorvastatin', 'lipitor'],
        guideIds: ['lipids'],
        summary: '常用于高胆固醇和心血管风险管理，需要长期、规律地按医嘱服用，不建议看到化验好转后自行停药。',
        commonUses: ['高胆固醇', '混合型血脂异常', '心脑血管风险较高人群的长期调脂管理'],
        dailyFocus: [
            '通常每天固定时间服用更容易坚持，餐前餐后一般都可，但请以处方说明为准。',
            '如果出现不明原因肌肉酸痛、无力、深色尿，应尽快联系医生。',
            '复查血脂、肝功能时，最好把近 1 到 2 周的服药和饮食情况一并告诉医生。'
        ],
        askDoctor: [
            '我的目标 LDL-C 应控制到多少？多久复查一次血脂？',
            '我现在服用的其他药物会不会增加肌肉或肝功能风险？',
            '如果漏服一两次，后续应该怎么补？'
        ]
    },
    {
        id: 'metformin',
        canonicalName: '二甲双胍',
        englishName: 'metformin',
        category: '降糖药',
        aliases: ['二甲双胍', '格华止', 'metformin', 'glucophage'],
        apiSearchTerms: ['metformin', 'glucophage'],
        guideIds: ['diabetes', 'ckd'],
        summary: '常见于 2 型糖尿病基础治疗，重点是长期、规律服用，并结合饮食、活动和血糖监测一起管理。',
        commonUses: ['2 型糖尿病', '胰岛素抵抗相关场景需由医生评估后使用'],
        dailyFocus: [
            '胃胀、腹泻、恶心等胃肠反应在起始或加量初期较常见，很多人随餐服用会更容易耐受。',
            '发热、脱水、严重感染、明显食欲差或准备做增强 CT/造影时，要先问医生是否需要临时调整。',
            '如果本身有肾功能问题，复诊时应主动带上最近的肾功能和血糖记录。'
        ],
        askDoctor: [
            '我目前更应该盯空腹血糖、餐后血糖，还是糖化血红蛋白？',
            '近期如果吃得少、腹泻或做造影检查，用药要不要调整？',
            '我是否需要定期复查肾功能和维生素 B12？'
        ]
    },
    {
        id: 'amlodipine',
        canonicalName: '氨氯地平',
        englishName: 'amlodipine',
        category: '降压药（钙通道阻滞剂）',
        aliases: ['氨氯地平', '苯磺酸氨氯地平', '络活喜', 'amlodipine', 'norvasc'],
        apiSearchTerms: ['amlodipine', 'norvasc'],
        guideIds: ['hypertension'],
        summary: '常用于高血压的长期控制，很多人需要持续服用并配合家庭血压记录，不能凭当日血压正常就自行停药。',
        commonUses: ['高血压', '部分心绞痛或心血管长期管理场景'],
        dailyFocus: [
            '建议固定时间服用，复诊时把一段时间的家庭血压趋势带给医生看。',
            '开始服药或加量后如果出现明显头晕、脚踝水肿、心慌，应及时反馈。',
            '同时控制盐摄入、体重和睡眠，对长期血压控制很重要。'
        ],
        askDoctor: [
            '我目前的家庭血压目标范围是多少？',
            '出现头晕或脚踝肿胀时，需要调整剂量还是换药？',
            '是否需要和其他降压药联合使用？'
        ]
    },
    {
        id: 'valsartan',
        canonicalName: '缬沙坦',
        englishName: 'valsartan',
        category: '降压药（ARB 类）',
        aliases: ['缬沙坦', '代文', 'valsartan', 'diovan'],
        apiSearchTerms: ['valsartan', 'diovan'],
        guideIds: ['hypertension', 'ckd'],
        summary: '多用于高血压及部分心肾保护场景，重点在于长期管理和按计划复查肾功能、电解质与血压趋势。',
        commonUses: ['高血压', '部分心衰或肾脏保护场景需医生评估'],
        dailyFocus: [
            '开始治疗或加量后，复查血压、肾功能、血钾往往比只看当天感觉更重要。',
            '明显乏力、心悸、尿量变化、头晕或低血压症状要及时告知医生。',
            '不要因为几次血压正常就擅自停药或减量。'
        ],
        askDoctor: [
            '我需要多久复查一次肾功能和血钾？',
            '如果近期腹泻、呕吐或脱水，用药要不要先联系医生？',
            '我是否需要和别的降压药联合使用？'
        ]
    },
    {
        id: 'losartan',
        canonicalName: '氯沙坦',
        englishName: 'losartan',
        category: '降压药（ARB 类）',
        aliases: ['氯沙坦', '氯沙坦钾', 'losartan', 'cozaar', '科素亚'],
        apiSearchTerms: ['losartan', 'cozaar'],
        guideIds: ['hypertension', 'ckd'],
        summary: '常见于高血压和部分肾脏保护管理场景，规律服药和复查比偶尔一次血压结果更重要。',
        commonUses: ['高血压', '部分糖尿病肾病或蛋白尿场景需医生评估'],
        dailyFocus: [
            '如果出现头晕、站起不稳、尿量变化或持续乏力，要尽快和医生沟通。',
            '复诊时建议带上血压记录和最近的肾功能、血钾检查结果。',
            '同时服用止痛药、利尿剂或补钾产品时，更要主动咨询医生或药师。'
        ],
        askDoctor: [
            '我现在的血压和肾功能控制目标是什么？',
            '我服用的其他药会不会影响血钾或肾功能？',
            '如果血压偏低或近期食量差，用药要如何处理？'
        ]
    },
    {
        id: 'aspirin',
        canonicalName: '阿司匹林',
        englishName: 'aspirin',
        category: '抗血小板药 / 解热镇痛药',
        aliases: ['阿司匹林', '拜阿司匹灵', 'aspirin', 'bayer'],
        apiSearchTerms: ['aspirin', 'bayer'],
        guideIds: [],
        summary: '阿司匹林用途很多，低剂量多见于心脑血管二级预防，普通剂量也可用于止痛退热；不同目的的剂量和疗程差别很大，不能混用。',
        commonUses: ['心脑血管事件预防需医生评估', '发热、疼痛等短期处理'],
        dailyFocus: [
            '如果是长期抗血小板用途，不要因短期没感觉到效果就随意停药。',
            '胃痛、黑便、呕血、异常出血倾向等情况要尽快就医。',
            '准备拔牙、手术或同时服用其他抗凝药前，应提前问医生。'
        ],
        askDoctor: [
            '我现在服用的是低剂量长期预防，还是短期止痛退热？',
            '如果同时服用其他止痛药或抗凝药，要注意什么？',
            '出现胃部不适或出血风险时，是否需要调整方案？'
        ]
    },
    {
        id: 'omeprazole',
        canonicalName: '奥美拉唑',
        englishName: 'omeprazole',
        category: '抑酸药（PPI）',
        aliases: ['奥美拉唑', 'omeprazole', 'prilosec', '洛赛克'],
        apiSearchTerms: ['omeprazole', 'prilosec'],
        guideIds: [],
        summary: '常用于胃食管反流、胃溃疡和抑酸保护场景，很多人需要在固定时间服用，但长期使用应定期和医生评估是否仍然需要。',
        commonUses: ['胃食管反流', '胃溃疡或胃黏膜保护', '部分需联合其他药物的胃部保护场景'],
        dailyFocus: [
            '通常建议按处方要求在固定时间服用，很多方案会安排在餐前。',
            '如果症状反复、吞咽困难、黑便、体重明显下降，需要尽快复诊。',
            '长期持续使用时，应和医生确认是否还有必要、是否需要减量或停药计划。'
        ],
        askDoctor: [
            '我是短期治疗还是需要阶段性维持？',
            '如果症状已经缓解，后面如何减量或停药更安全？',
            '我同时服用其他药物时，会不会影响吸收或相互作用？'
        ]
    },
    {
        id: 'amoxicillin',
        canonicalName: '阿莫西林',
        englishName: 'amoxicillin',
        category: '抗感染药（青霉素类）',
        aliases: ['阿莫西林', 'amoxicillin', 'amoxil'],
        apiSearchTerms: ['amoxicillin', 'amoxil'],
        guideIds: [],
        summary: '阿莫西林属于处方抗感染药，是否适合使用、用多久、是否需要联合其他药，都应由医生根据感染类型判断。',
        commonUses: ['部分细菌感染的治疗需医生诊断后使用'],
        dailyFocus: [
            '不要把“以前吃过有效”当作这次也适合使用的依据。',
            '过敏史非常重要，出现皮疹、呼吸困难、喉头紧缩等要立即就医。',
            '抗感染药一般要按疗程足量使用，症状缓解也不要自行提前停药。'
        ],
        askDoctor: [
            '我这次感染是否明确需要抗生素？',
            '如果吃了两三天仍无改善，应该继续还是复诊？',
            '我以前有药物过敏或腹泻史，这次要注意什么？'
        ]
    },
    {
        id: 'ibuprofen',
        canonicalName: '布洛芬',
        englishName: 'ibuprofen',
        category: '止痛退热药（NSAIDs）',
        aliases: ['布洛芬', 'ibuprofen', 'advil', 'motrin'],
        apiSearchTerms: ['ibuprofen', 'advil'],
        guideIds: ['ckd'],
        summary: '布洛芬常用于短期止痛退热，但如果有胃病、肾功能问题、脱水、高龄或正在服用抗凝/降压药，更需要先问医生或药师。',
        commonUses: ['发热', '头痛、牙痛、肌肉关节痛等短期症状缓解'],
        dailyFocus: [
            '按说明或处方短期使用更安全，不建议长期连续自行服用。',
            '胃痛、黑便、明显头晕、尿量减少、下肢浮肿时要及时停用并就医。',
            '慢性肾病、高血压、心衰或脱水状态下，更要谨慎使用。'
        ],
        askDoctor: [
            '我现在的年龄、胃肠和肾功能状况适合用这类止痛药吗？',
            '如果正在服用阿司匹林、抗凝药或降压药，会不会有冲突？',
            '疼痛持续多久需要换成就医而不是继续自行吃药？'
        ]
    }
];
