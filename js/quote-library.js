(function () {
  "use strict";

  const library = {
  "math": [
    {
      "text": "通往几何学，没有专为国王铺设的大道。",
      "author": "欧几里得",
      "source": "普罗克洛斯《欧几里得〈几何原本〉第一卷评注》",
      "note": "translated"
    },
    {
      "text": "给我一个支点，我就能撬动整个地球。",
      "author": "阿基米德",
      "source": "帕普斯《数学汇编》第八卷所载",
      "note": "translated"
    },
    {
      "text": "宇宙这部大书，是用数学语言写成的。",
      "author": "伽利略",
      "source": "《试金者》（Il Saggiatore，1623）",
      "note": "translated"
    },
    {
      "text": "数学是诸科学的大门与钥匙。",
      "author": "罗杰·培根",
      "source": "《大著作》（Opus Majus）第四部分",
      "note": "translated"
    },
    {
      "text": "把每个困难分成尽可能多且必要的小部分。",
      "author": "勒内·笛卡尔",
      "source": "《谈谈方法》第二部分",
      "note": "translated"
    },
    {
      "text": "理性的最后一步，是承认有无穷多事物超越理性。",
      "author": "布莱兹·帕斯卡",
      "source": "《思想录》残篇，论理性的界限",
      "note": "translated"
    },
    {
      "text": "若说我看得更远，是因为站在巨人的肩上。",
      "author": "艾萨克·牛顿",
      "source": "致罗伯特·胡克的信（1676年2月5日）",
      "note": "translated"
    },
    {
      "text": "我不虚构假说；从现象未能推出的，不应称为假说。",
      "author": "艾萨克·牛顿",
      "source": "《自然哲学的数学原理》第二版总释",
      "note": "translated"
    },
    {
      "text": "音乐是心灵在不自觉中进行的隐秘算术练习。",
      "author": "戈特弗里德·莱布尼茨",
      "source": "致克里斯蒂安·哥德巴赫的信（1712）",
      "note": "translated"
    },
    {
      "text": "宇宙万物之中，无不显现某种最大或最小的法则。",
      "author": "莱昂哈德·欧拉",
      "source": "《Methodus inveniendi lineas curvas maximi minimive proprietate gaudentes》（1744）附录",
      "note": "translated"
    },
    {
      "text": "数学是科学的皇后，数论是数学的皇后。",
      "author": "卡尔·弗里德里希·高斯",
      "source": "沃尔夫冈·萨托里乌斯《高斯纪念录》所载",
      "note": "translated"
    },
    {
      "text": "宁取少而成熟的成果，不求多而仓促的结论。",
      "author": "卡尔·弗里德里希·高斯",
      "source": "高斯箴言“Pauca sed matura”",
      "note": "paraphrase"
    },
    {
      "text": "数学意义的证明，必须使每一个疑点都不复存在。",
      "author": "卡尔·弗里德里希·高斯",
      "source": "《Calculus Gems》所录高斯论证明",
      "note": "translated"
    },
    {
      "text": "这部著作里找不到图，只有代数运算。",
      "author": "约瑟夫·拉格朗日",
      "source": "《分析力学》序言",
      "note": "translated"
    },
    {
      "text": "若有智慧能知一切力与位置，未来便如过去般呈现。",
      "author": "皮埃尔-西蒙·拉普拉斯",
      "source": "《概率论的哲学论述》导论",
      "note": "paraphrase"
    },
    {
      "text": "数学分析能把最广泛的关系译成最简洁的语言。",
      "author": "约瑟夫·傅里叶",
      "source": "《热的解析理论》初步论述",
      "note": "paraphrase"
    },
    {
      "text": "在分析中，收敛与连续不能只凭直觉，必须精确定义。",
      "author": "奥古斯丁-路易·柯西",
      "source": "《分析教程》序言与第一章",
      "note": "paraphrase"
    },
    {
      "text": "学习大师，而不要只学习他们的学生。",
      "author": "尼尔斯·亨里克·阿贝尔",
      "source": "致贝恩特·霍尔姆博的信（1826）",
      "note": "translated"
    },
    {
      "text": "必须不断反演；反过来看，常会显出新的道路。",
      "author": "卡尔·古斯塔夫·雅可比",
      "source": "雅可比箴言“man muss immer umkehren”",
      "note": "paraphrase"
    },
    {
      "text": "几何的基础假设，也应接受事实与逻辑的共同检验。",
      "author": "伯恩哈德·黎曼",
      "source": "《论作为几何基础的假设》（1854）",
      "note": "paraphrase"
    },
    {
      "text": "数是人类心灵的自由创造，帮助我们把握事物差异。",
      "author": "理查德·戴德金",
      "source": "《数是什么及其作用是什么？》序言",
      "note": "translated"
    },
    {
      "text": "上帝创造了整数，其余一切都是人的工作。",
      "author": "利奥波德·克罗内克",
      "source": "海因里希·韦伯1893年演讲所录",
      "note": "translated"
    },
    {
      "text": "数学的本质，就在于它的自由。",
      "author": "格奥尔格·康托尔",
      "source": "《关于无限线性点集理论的基础》（1883）",
      "note": "translated"
    },
    {
      "text": "我们必须知道，我们终将知道。",
      "author": "大卫·希尔伯特",
      "source": "柯尼斯堡广播演讲（1930），后刻于墓碑",
      "note": "translated"
    },
    {
      "text": "证明应依靠思想，而不是堆积浩繁的数值计算。",
      "author": "大卫·希尔伯特",
      "source": "《数论报告》（1897）",
      "note": "translated"
    },
    {
      "text": "做数学的艺术，在于找到蕴含全部一般性的特例。",
      "author": "大卫·希尔伯特",
      "source": "《Mathematical Maxims and Minims》所录",
      "note": "translated"
    },
    {
      "text": "一种数学理论，直到能向街上的人讲清楚才算完整。",
      "author": "大卫·希尔伯特",
      "source": "康斯坦丝·里德《Hilbert》所载",
      "note": "translated"
    },
    {
      "text": "数学是给不同事物取同一个名字的艺术。",
      "author": "亨利·庞加莱",
      "source": "《科学与方法》，论数学类比",
      "note": "translated"
    },
    {
      "text": "数学家研究的不是对象，而是对象之间的关系。",
      "author": "亨利·庞加莱",
      "source": "《科学与假设》",
      "note": "translated"
    },
    {
      "text": "事实构成科学，如石头构成房屋；石堆却不是房屋。",
      "author": "亨利·庞加莱",
      "source": "《科学与假设》",
      "note": "translated"
    },
    {
      "text": "初始条件的微小差异，可能造成最终现象的巨大差异。",
      "author": "亨利·庞加莱",
      "source": "《科学与方法》，论偶然性",
      "note": "translated"
    },
    {
      "text": "数学发现不会凭空产生，它需要知识播种与劳动耕耘。",
      "author": "亨利·庞加莱",
      "source": "《科学与方法》，数学创造篇",
      "note": "paraphrase"
    },
    {
      "text": "数学家如画家诗人一样，是模式的创造者。",
      "author": "戈弗雷·哈代",
      "source": "《一个数学家的辩白》第十节",
      "note": "translated"
    },
    {
      "text": "美是数学思想的第一道检验；丑陋数学难有永久位置。",
      "author": "戈弗雷·哈代",
      "source": "《一个数学家的辩白》第十节",
      "note": "translated"
    },
    {
      "text": "纯粹数学以冷峻而朴素的美，达到最严格的完美。",
      "author": "伯特兰·罗素",
      "source": "《数学研究》（The Study of Mathematics，1902）",
      "note": "paraphrase"
    },
    {
      "text": "文明通过增加那些无须思考即可完成的操作而进步。",
      "author": "阿尔弗雷德·诺思·怀特海",
      "source": "《数学导论》第五章",
      "note": "translated"
    },
    {
      "text": "数学首先是心灵的自由活动，而非纸上符号的游戏。",
      "author": "路伊岑·布劳威尔",
      "source": "《直觉主义与形式主义》（1912）",
      "note": "paraphrase"
    },
    {
      "text": "我的工作总试图结合真与美；冲突时，我通常选择美。",
      "author": "赫尔曼·外尔",
      "source": "弗里曼·戴森《Obituary of Hermann Weyl》，Nature 177（1956）所录",
      "note": "translated"
    },
    {
      "text": "我的方法，是工作与思考的方法；因此会悄然延续。",
      "author": "埃米·诺特",
      "source": "赫尔曼·外尔《Emmy Noether》纪念演讲（1935）所录",
      "note": "paraphrase"
    },
    {
      "text": "足够强且一致的形式系统，总有真命题无法在其中证明。",
      "author": "库尔特·哥德尔",
      "source": "《〈数学原理〉及有关系统中的形式不可判定命题》（1931）",
      "note": "paraphrase"
    },
    {
      "text": "给出真理定义，必须区分被谈论的语言与元语言。",
      "author": "阿尔弗雷德·塔斯基",
      "source": "《形式化语言中的真理概念》（1933）",
      "note": "paraphrase"
    },
    {
      "text": "不存在一种算法，能判定任意逻辑公式是否可证。",
      "author": "阿隆佐·丘奇",
      "source": "《初等数论的一个不可解问题》（1936）",
      "note": "paraphrase"
    },
    {
      "text": "机械计算可由一台在纸带上读写符号的机器刻画。",
      "author": "艾伦·图灵",
      "source": "《论可计算数及其在判定问题上的应用》（1936）",
      "note": "paraphrase"
    },
    {
      "text": "你不必相信上帝，却应相信那本收录最美证明的书。",
      "author": "保罗·埃尔德什",
      "source": "保罗·霍夫曼《The Man Who Loved Only Numbers》所载“上帝之书”比喻",
      "note": "paraphrase"
    },
    {
      "text": "一个方程若不能表达上帝的思想，对我便毫无意义。",
      "author": "斯里尼瓦瑟·拉马努金",
      "source": "P. K. Srinivasan《Ramanujan: Letters and Reminiscences》所载",
      "note": "translated"
    },
    {
      "text": "突然的灵感并非凭空降临，它由长期有意识的劳动准备。",
      "author": "雅克·阿达马",
      "source": "《数学领域中的发明心理学》",
      "note": "paraphrase"
    },
    {
      "text": "若有一道题不会解，就去寻找一道你能解的更容易的题。",
      "author": "乔治·波利亚",
      "source": "《怎样解题》",
      "note": "translated"
    },
    {
      "text": "解完题后回头审视；任何问题都不会被一次解答穷尽。",
      "author": "乔治·波利亚",
      "source": "《怎样解题》第四阶段“回顾”",
      "note": "paraphrase"
    },
    {
      "text": "证明定理之前，先彻底理解它，并检验它是否可能为假。",
      "author": "乔治·波利亚",
      "source": "《怎样解题》",
      "note": "translated"
    },
    {
      "text": "证明定理并非机械演绎，而是试错、实验与猜测。",
      "author": "保罗·哈尔莫斯",
      "source": "《I Want to Be a Mathematician》",
      "note": "translated"
    },
    {
      "text": "数学的心脏，是它所提出并追索的问题。",
      "author": "保罗·哈尔莫斯",
      "source": "D. MacHale《Comic Sections》（1993）所录",
      "note": "translated"
    },
    {
      "text": "证明不是终点；反例会修正定义，也会推动定理成长。",
      "author": "伊姆雷·拉卡托斯",
      "source": "《证明与反驳》",
      "note": "paraphrase"
    },
    {
      "text": "数学的进步，不只靠证明，更靠传递理解与思维方式。",
      "author": "威廉·瑟斯顿",
      "source": "《On Proof and Progress in Mathematics》（1994）",
      "note": "paraphrase"
    },
    {
      "text": "数学是物理学的一部分，是实验揭示自然规律的科学。",
      "author": "弗拉基米尔·阿诺尔德",
      "source": "《On Teaching Mathematics》（1998）",
      "note": "paraphrase"
    },
    {
      "text": "面对难题，与其逐石敲碎，不如让理解之海慢慢升高。",
      "author": "亚历山大·格罗滕迪克",
      "source": "《Récoltes et Semailles》“上升之海”比喻",
      "note": "paraphrase"
    },
    {
      "text": "好定理应有多个证明，因为不同证明通向不同推广。",
      "author": "迈克尔·阿蒂亚",
      "source": "与伊萨多·辛格的访谈，European Mathematical Society Newsletter 53（2004）",
      "note": "paraphrase"
    },
    {
      "text": "多数深刻的数学问题，在根底上都藏着组合问题。",
      "author": "伊斯拉埃尔·盖尔范德",
      "source": "库朗研究所演讲（1990）",
      "note": "translated"
    },
    {
      "text": "最好的数学家，能看见不同类比之间更深的类比。",
      "author": "斯特凡·巴拿赫",
      "source": "《Mathematical Maxims and Minims》所录",
      "note": "paraphrase"
    },
    {
      "text": "概率论可以而且应当像几何与代数一样从公理发展。",
      "author": "安德雷·柯尔莫哥洛夫",
      "source": "《概率论基础》",
      "note": "translated"
    },
    {
      "text": "大量随机现象汇聚起来，会显现非随机的规律。",
      "author": "安德雷·柯尔莫哥洛夫",
      "source": "《独立随机变量和的极限分布》（1954）",
      "note": "translated"
    },
    {
      "text": "在数学里，你并不理解事物，只是逐渐习惯它们。",
      "author": "约翰·冯·诺依曼",
      "source": "G. Zukav《The Dancing Wu Li Masters》所录",
      "note": "translated"
    },
    {
      "text": "模型的正当性不在于像现实，而在于它确实能够工作。",
      "author": "约翰·冯·诺依曼",
      "source": "《Method in the Physical Sciences》",
      "note": "paraphrase"
    },
    {
      "text": "数学在自然科学中不可思议的有效性，仍是一份奇妙礼物。",
      "author": "尤金·维格纳",
      "source": "《The Unreasonable Effectiveness of Mathematics in the Natural Sciences》（1960）",
      "note": "paraphrase"
    },
    {
      "text": "什么是数学，只能由亲身进行数学活动来回答。",
      "author": "理查德·库朗",
      "source": "与赫伯特·罗宾斯合著《什么是数学？》",
      "note": "translated"
    },
    {
      "text": "要理解自然，或许必须更深入地理解数学关系。",
      "author": "理查德·费曼",
      "source": "《费曼物理学讲义》第一卷，数学与物理的关系",
      "note": "translated"
    },
    {
      "text": "数学特别适合处理抽象概念，在这一领域它的力量无边。",
      "author": "保罗·狄拉克",
      "source": "《量子力学原理》序言（1930）",
      "note": "translated"
    },
    {
      "text": "只要几何命题是确定的，它就不谈经验现实。",
      "author": "阿尔伯特·爱因斯坦",
      "source": "《几何与经验》（1921）",
      "note": "paraphrase"
    },
    {
      "text": "物理类比让一个科学的规律，照亮另一个科学的规律。",
      "author": "詹姆斯·克拉克·麦克斯韦",
      "source": "《论法拉第力线》（1856）",
      "note": "paraphrase"
    },
    {
      "text": "能测量并用数字表达时，你才真正知道了一些东西。",
      "author": "开尔文勋爵",
      "source": "《Electrical Units of Measurement》演讲（1883）",
      "note": "translated"
    },
    {
      "text": "所有模型本质上都是错的，但其中一些确实有用。",
      "author": "乔治·博克斯",
      "source": "《Empirical Model-Building and Response Surfaces》（1987）",
      "note": "translated"
    },
    {
      "text": "对正确问题给出近似答案，远胜于精确回答错误问题。",
      "author": "约翰·图基",
      "source": "《The Future of Data Analysis》（1962）",
      "note": "translated"
    },
    {
      "text": "计算的目的在于获得洞见，而不只是得到数字。",
      "author": "理查德·汉明",
      "source": "《Numerical Methods for Scientists and Engineers》题辞",
      "note": "translated"
    },
    {
      "text": "用错误方法做正确问题，也胜过用正确方法做错误问题。",
      "author": "理查德·汉明",
      "source": "《The Art of Doing Science and Engineering》",
      "note": "translated"
    },
    {
      "text": "通信的根本问题，是在一处复现另一处选定的消息。",
      "author": "克劳德·香农",
      "source": "《A Mathematical Theory of Communication》（1948）",
      "note": "translated"
    },
    {
      "text": "分析机编织代数模式，如同提花织机编织花叶。",
      "author": "阿达·洛芙莱斯",
      "source": "《分析机概论》译注，注释A（1843）",
      "note": "translated"
    },
    {
      "text": "计算过程常有多种排列，应选择能把耗时降至最低者。",
      "author": "阿达·洛芙莱斯",
      "source": "《分析机概论》译注（1843）",
      "note": "translated"
    },
    {
      "text": "请当心上面代码里的错误；我只证明过它，并未运行。",
      "author": "高德纳",
      "source": "致彼得·范·埃姆德·博阿斯的信（1977）",
      "note": "translated"
    },
    {
      "text": "过早优化，是程序设计中一切祸害的根源。",
      "author": "高德纳",
      "source": "《Structured Programming with go to Statements》（1974）",
      "note": "translated"
    },
    {
      "text": "程序测试只能显示错误存在，不能证明错误不存在。",
      "author": "艾兹赫尔·戴克斯特拉",
      "source": "《Notes on Structured Programming》（1969）",
      "note": "translated"
    },
    {
      "text": "软件设计有两条路：简单到显然无错，或复杂到看不出错。",
      "author": "托尼·霍尔",
      "source": "图灵奖演讲《The Emperor's Old Clothes》（1980）",
      "note": "translated"
    },
    {
      "text": "程序等于算法加数据结构，两者共同决定计算的形态。",
      "author": "尼克劳斯·维尔特",
      "source": "《Algorithms + Data Structures = Programs》（1976）",
      "note": "paraphrase"
    },
    {
      "text": "数值线性代数研究在计算机上执行线性代数运算的算法。",
      "author": "劳埃德·特雷弗森、戴维·鲍",
      "source": "《Numerical Linear Algebra》讲义一",
      "note": "paraphrase"
    },
    {
      "text": "数值计算让数学现场发生在屏幕上，也发生在指尖。",
      "author": "劳埃德·特雷弗森",
      "source": "《An Applied Mathematician's Apology》第五章",
      "note": "paraphrase"
    },
    {
      "text": "舍入误差分析的任务，是解释计算结果为何偏离精确答案。",
      "author": "詹姆斯·威尔金森",
      "source": "《Rounding Errors in Algebraic Processes》（1963）",
      "note": "paraphrase"
    },
    {
      "text": "稳定算法给出的结果，应是邻近问题的精确解。",
      "author": "尼古拉斯·海厄姆",
      "source": "《Accuracy and Stability of Numerical Algorithms》第二版",
      "note": "paraphrase"
    },
    {
      "text": "浮点运算不是实数运算；算法必须尊重它的离散规则。",
      "author": "威廉·卡汉",
      "source": "《IEEE Standard 754 for Binary Floating-Point Arithmetic》相关讲义",
      "note": "paraphrase"
    },
    {
      "text": "矩阵计算把数学模型转成可执行的科学计算。",
      "author": "吉恩·戈卢布、查尔斯·范洛恩",
      "source": "《Matrix Computations》第四版序言",
      "note": "paraphrase"
    },
    {
      "text": "高效还不够；数值算法还必须可靠、稳定并理解误差。",
      "author": "詹姆斯·德梅尔",
      "source": "《Applied Numerical Linear Algebra》序言",
      "note": "paraphrase"
    },
    {
      "text": "让矩阵成为一等对象，计算者才能直接试验线性代数。",
      "author": "克里夫·莫勒",
      "source": "《Numerical Computing with MATLAB》第一章",
      "note": "paraphrase"
    },
    {
      "text": "对适定线性问题，一致且稳定的差分格式必然收敛。",
      "author": "彼得·拉克斯、罗伯特·里希特迈耶",
      "source": "《Survey of the Stability of Linear Finite Difference Equations》（1956）",
      "note": "paraphrase"
    },
    {
      "text": "数值格式的依赖域，必须覆盖微分方程的依赖域。",
      "author": "库朗、弗里德里希、列维",
      "source": "《Über die partiellen Differenzengleichungen der mathematischen Physik》（1928）",
      "note": "paraphrase"
    },
    {
      "text": "线性多步法要收敛，必须同时满足一致性与零稳定性。",
      "author": "热尔芒·达尔奎斯特",
      "source": "《Convergence and Stability in the Numerical Integration of ODEs》（1956）",
      "note": "paraphrase"
    },
    {
      "text": "一致性给出局部正确，稳定性把它传递成整体收敛。",
      "author": "吉尔伯特·斯特朗",
      "source": "《Accurate Partial Difference Methods I》（1964）及相关稳定性论述",
      "note": "paraphrase"
    },
    {
      "text": "病态程度衡量输入微扰被问题本身放大的倍数。",
      "author": "艾伦·图灵",
      "source": "《Rounding-off Errors in Matrix Processes》（1948）",
      "note": "paraphrase"
    },
    {
      "text": "数值实验不是证明的替代品，却常是发现结构的实验室。",
      "author": "乔治·福赛思",
      "source": "《Pitfalls in Computation, or Why a Math Book Isn't Enough》（1970）",
      "note": "paraphrase"
    },
    {
      "text": "计算成本不断下降，我们就应把越来越多时间用于计算。",
      "author": "约翰·图基",
      "source": "《The Collected Works of John W. Tukey》及 American Statistician 40（1986）所录",
      "note": "paraphrase"
    },
    {
      "text": "要知道干预系统会发生什么，就必须真正干预它。",
      "author": "乔治·博克斯",
      "source": "《Use and Abuse of Regression》（1966）",
      "note": "translated"
    },
    {
      "text": "确定性的方程，也能产生永不重复的非周期流动。",
      "author": "爱德华·洛伦兹",
      "source": "《Deterministic Nonperiodic Flow》（1963）",
      "note": "paraphrase"
    },
    {
      "text": "云不是球，山不是圆锥；自然的粗糙也需要几何。",
      "author": "伯努瓦·曼德布罗",
      "source": "《The Fractal Geometry of Nature》（1982）",
      "note": "translated"
    },
    {
      "text": "科学是我们已理解到能教给计算机的部分，其余是艺术。",
      "author": "高德纳",
      "source": "《A=B》序言（1996）",
      "note": "translated"
    }
  ],
  "scifi": [
    {
      "text": "弱小和无知不是生存的障碍，傲慢才是。",
      "author": "刘慈欣",
      "source": "《死神永生》",
      "note": "exact"
    },
    {
      "text": "黑暗森林里，暴露坐标本身就是最危险的回答。",
      "author": "刘慈欣",
      "source": "《黑暗森林》",
      "note": "paraphrase"
    },
    {
      "text": "宇宙可以归零，人类仍要为自己的选择负责。",
      "author": "刘慈欣",
      "source": "《死神永生》",
      "note": "paraphrase"
    },
    {
      "text": "偶然劈开的闪电，也可能照见物质最深的秘密。",
      "author": "刘慈欣",
      "source": "《球状闪电》",
      "note": "paraphrase"
    },
    {
      "text": "当地球踏上旅途，故乡便成为共同的航船。",
      "author": "刘慈欣",
      "source": "《流浪地球》",
      "note": "paraphrase"
    },
    {
      "text": "当未来化作红色海洋，文明仍要面对自己的倒影。",
      "author": "韩松",
      "source": "《红色海洋》",
      "note": "paraphrase"
    },
    {
      "text": "当造物者被称作父母，生命的边界必须重新商议。",
      "author": "王晋康",
      "source": "《天父地母》",
      "note": "paraphrase"
    },
    {
      "text": "被时代拒绝的证明，也可能在未来通向真理。",
      "author": "何夕",
      "source": "《伤心者》",
      "note": "paraphrase"
    },
    {
      "text": "城市能够折叠，人的时间与尊严却不能平均。",
      "author": "郝景芳",
      "source": "《北京折叠》",
      "note": "paraphrase"
    },
    {
      "text": "技术清理了海岸，也可能把记忆变成新的废墟。",
      "author": "陈楸帆",
      "source": "《荒潮》",
      "note": "paraphrase"
    },
    {
      "text": "暴力是无能者最后的避难所。",
      "author": "艾萨克·阿西莫夫",
      "source": "《基地》",
      "note": "translated"
    },
    {
      "text": "机器遵守规则时，人类更应审视规则的边界。",
      "author": "艾萨克·阿西莫夫",
      "source": "《我，机器人》",
      "note": "paraphrase"
    },
    {
      "text": "修补时间的人，最终必须面对未经修补的人生。",
      "author": "艾萨克·阿西莫夫",
      "source": "《永恒的终结》",
      "note": "paraphrase"
    },
    {
      "text": "智慧若只相信自己，便可能看不见另一半宇宙。",
      "author": "艾萨克·阿西莫夫",
      "source": "《神们自己》",
      "note": "paraphrase"
    },
    {
      "text": "时间若被反复重置，真正珍贵的是仍愿意记住。",
      "author": "宝树",
      "source": "《时间之墟》",
      "note": "paraphrase"
    },
    {
      "text": "面对未知文明，理解比征服更接近真正的进化。",
      "author": "阿瑟·克拉克",
      "source": "《童年的终结》",
      "note": "paraphrase"
    },
    {
      "text": "沉默的造物无需解释，尺度本身就是它的语言。",
      "author": "阿瑟·克拉克",
      "source": "《与拉玛相会》",
      "note": "paraphrase"
    },
    {
      "text": "工具唤醒心智之后，人类才真正开始仰望群星。",
      "author": "阿瑟·克拉克",
      "source": "《2001：太空漫游》",
      "note": "paraphrase"
    },
    {
      "text": "科学打开妖精的瓶子，也要承担随之而来的愿望。",
      "author": "夏笳",
      "source": "《关妖精的瓶子》",
      "note": "paraphrase"
    },
    {
      "text": "任何足够先进的技术，都与魔法难以区分。",
      "author": "阿瑟·克拉克",
      "source": "《未来的轮廓》",
      "note": "translated"
    },
    {
      "text": "理解另一个世界，先要放下自己唯一的尺度。",
      "author": "厄休拉·勒古恩",
      "source": "《黑暗的左手》",
      "note": "paraphrase"
    },
    {
      "text": "真正的自由，不应以另一群人的围墙为边界。",
      "author": "厄休拉·勒古恩",
      "source": "《一无所有》",
      "note": "paraphrase"
    },
    {
      "text": "把森林叫作资源之前，先听见它原本的名字。",
      "author": "厄休拉·勒古恩",
      "source": "《世界的词语是森林》",
      "note": "paraphrase"
    },
    {
      "text": "梦若能改写现实，醒来便不再是简单的出口。",
      "author": "厄休拉·勒古恩",
      "source": "《天钧》",
      "note": "paraphrase"
    },
    {
      "text": "银河再辽阔，文明的黄昏仍由具体的人见证。",
      "author": "江波",
      "source": "《银河之心》",
      "note": "paraphrase"
    },
    {
      "text": "天下从来没有真正免费的午餐。",
      "author": "罗伯特·海因莱因",
      "source": "《严厉的月亮》",
      "note": "translated"
    },
    {
      "text": "陌生人带来的问题，常比我们熟悉的答案诚实。",
      "author": "罗伯特·海因莱因",
      "source": "《异乡异客》",
      "note": "paraphrase"
    },
    {
      "text": "制度要求牺牲之前，应先回答它守护了谁。",
      "author": "罗伯特·海因莱因",
      "source": "《星船伞兵》",
      "note": "paraphrase"
    },
    {
      "text": "当所有声音被系统过滤，沉默也会成为一种语言。",
      "author": "马伯庸",
      "source": "《寂静之城》",
      "note": "paraphrase"
    },
    {
      "text": "穿过时间去寻找春天，也是在寻找重新开始。",
      "author": "罗伯特·海因莱因",
      "source": "《夏日之门》",
      "note": "paraphrase"
    },
    {
      "text": "若记忆能够植入，真实便成为最昂贵的疑问。",
      "author": "菲利普·迪克",
      "source": "《仿生人会梦见电子羊吗？》",
      "note": "paraphrase"
    },
    {
      "text": "历史换了一条轨道，良知仍要独自辨认方向。",
      "author": "菲利普·迪克",
      "source": "《高堡奇人》",
      "note": "paraphrase"
    },
    {
      "text": "当万物开始失真，信任便成了最后的现实。",
      "author": "菲利普·迪克",
      "source": "《尤比克》",
      "note": "paraphrase"
    },
    {
      "text": "提前惩罚尚未发生的罪，会让未来失去自由。",
      "author": "菲利普·迪克",
      "source": "《少数派报告》",
      "note": "paraphrase"
    },
    {
      "text": "时间弯成闭环之后，每次选择都在重新定义起点。",
      "author": "顾适",
      "source": "《莫比乌斯时空》",
      "note": "paraphrase"
    },
    {
      "text": "我绝不能恐惧，恐惧是思维的杀手。",
      "author": "弗兰克·赫伯特",
      "source": "《沙丘》",
      "note": "translated"
    },
    {
      "text": "预见所有道路的人，也会被自己的预言囚禁。",
      "author": "弗兰克·赫伯特",
      "source": "《沙丘救世主》",
      "note": "paraphrase"
    },
    {
      "text": "继承一个帝国容易，理解它的代价却很难。",
      "author": "弗兰克·赫伯特",
      "source": "《沙丘之子》",
      "note": "paraphrase"
    },
    {
      "text": "长久统治若以和平为名，也可能冻结人类。",
      "author": "弗兰克·赫伯特",
      "source": "《沙丘神帝》",
      "note": "paraphrase"
    },
    {
      "text": "技术发出耀眼光芒时，也会照见选择留下的阴影。",
      "author": "陈梓钧",
      "source": "《闪耀》",
      "note": "paraphrase"
    },
    {
      "text": "知道结局并不会取消选择，只会改变告别。",
      "author": "特德·姜",
      "source": "《你一生的故事》",
      "note": "paraphrase"
    },
    {
      "text": "当空气写完最后一页，理解便成为呼吸本身。",
      "author": "特德·姜",
      "source": "《呼吸》",
      "note": "paraphrase"
    },
    {
      "text": "登上天空不是为了抵达神，而是重新理解世界。",
      "author": "特德·姜",
      "source": "《巴比伦塔》",
      "note": "paraphrase"
    },
    {
      "text": "智力无限增长时，人与人的距离也可能无限增长。",
      "author": "特德·姜",
      "source": "《领悟》",
      "note": "paraphrase"
    },
    {
      "text": "数字生命需要的不是功能，而是漫长的陪伴。",
      "author": "特德·姜",
      "source": "《软件体的生命周期》",
      "note": "paraphrase"
    },
    {
      "text": "通向月球的第一步，始于把不可能写进工程图。",
      "author": "儒勒·凡尔纳",
      "source": "《从地球到月球》",
      "note": "paraphrase"
    },
    {
      "text": "海洋越深，人的自由与执念便显得越清晰。",
      "author": "儒勒·凡尔纳",
      "source": "《海底两万里》",
      "note": "paraphrase"
    },
    {
      "text": "向地下深入，也是在拓宽人类想象的边界。",
      "author": "儒勒·凡尔纳",
      "source": "《地心游记》",
      "note": "paraphrase"
    },
    {
      "text": "科学不只解决困境，也把陌生荒岛变成家园。",
      "author": "儒勒·凡尔纳",
      "source": "《神秘岛》",
      "note": "paraphrase"
    },
    {
      "text": "走向死亡的漫长旅途，也可能重新说明何为活着。",
      "author": "飞氘",
      "source": "《去死的漫漫旅途》",
      "note": "paraphrase"
    },
    {
      "text": "时间若是一条道路，人类终会走到自己的远方。",
      "author": "赫伯特·乔治·威尔斯",
      "source": "《时间机器》",
      "note": "paraphrase"
    },
    {
      "text": "强者俯视弱者时，最容易忘记宇宙也在俯视他。",
      "author": "赫伯特·乔治·威尔斯",
      "source": "《世界大战》",
      "note": "paraphrase"
    },
    {
      "text": "身体可以隐去，欲望与后果却仍然清晰可见。",
      "author": "赫伯特·乔治·威尔斯",
      "source": "《隐身人》",
      "note": "paraphrase"
    },
    {
      "text": "改造生命之前，先问自己是否理解生命。",
      "author": "赫伯特·乔治·威尔斯",
      "source": "《莫洛博士岛》",
      "note": "paraphrase"
    },
    {
      "text": "抵达月球并不等于拥有月球，更不等于理解它。",
      "author": "赫伯特·乔治·威尔斯",
      "source": "《最早登上月球的人》",
      "note": "paraphrase"
    },
    {
      "text": "创造生命的火焰，也会照亮创造者的责任。",
      "author": "玛丽·雪莱",
      "source": "《弗兰肯斯坦》",
      "note": "paraphrase"
    },
    {
      "text": "焚书的火焰最怕的，是仍有人记得那些文字。",
      "author": "雷·布拉德伯里",
      "source": "《华氏451》",
      "note": "paraphrase"
    },
    {
      "text": "我们把地球的旧梦带上火星，也带去了旧伤。",
      "author": "雷·布拉德伯里",
      "source": "《火星编年史》",
      "note": "paraphrase"
    },
    {
      "text": "控制语言的人，往往也在缩小思想的疆域。",
      "author": "乔治·奥威尔",
      "source": "《一九八四》",
      "note": "paraphrase"
    },
    {
      "text": "被安排好的幸福，可能只是失去选择后的安静。",
      "author": "阿道司·赫胥黎",
      "source": "《美丽新世界》",
      "note": "paraphrase"
    },
    {
      "text": "面对无法回应的海洋，人类听见的是自己的回声。",
      "author": "斯坦尼斯瓦夫·莱姆",
      "source": "《索拉里斯星》",
      "note": "paraphrase"
    },
    {
      "text": "机器的荒诞喜剧，常把人的逻辑照得最清楚。",
      "author": "斯坦尼斯瓦夫·莱姆",
      "source": "《机器人大师》",
      "note": "paraphrase"
    },
    {
      "text": "数据成为城市的神经后，身份也成了可破解的代码。",
      "author": "威廉·吉布森",
      "source": "《神经漫游者》",
      "note": "paraphrase"
    },
    {
      "text": "虚拟世界并不虚假，它同样会留下真实的伤口。",
      "author": "尼尔·斯蒂芬森",
      "source": "《雪崩》",
      "note": "paraphrase"
    },
    {
      "text": "天空破碎之后，文明必须把未来变成一项工程。",
      "author": "尼尔·斯蒂芬森",
      "source": "《七夏娃》",
      "note": "paraphrase"
    },
    {
      "text": "宇宙浩瀚得难以置信，所以别忘了带上毛巾。",
      "author": "道格拉斯·亚当斯",
      "source": "《银河系漫游指南》",
      "note": "paraphrase"
    },
    {
      "text": "时间可以失序，创伤却不会因此自动消失。",
      "author": "库尔特·冯内古特",
      "source": "《第五号屠宰场》",
      "note": "paraphrase"
    },
    {
      "text": "改变是唯一永恒的真理，适应则是活下去的技艺。",
      "author": "奥克塔维娅·巴特勒",
      "source": "《播种者寓言》",
      "note": "paraphrase"
    },
    {
      "text": "穿越过去无法旁观，因为历史会触碰你的身体。",
      "author": "奥克塔维娅·巴特勒",
      "source": "《亲缘》",
      "note": "paraphrase"
    },
    {
      "text": "当身体被制度占有，讲述自身便是一种抵抗。",
      "author": "玛格丽特·阿特伍德",
      "source": "《使女的故事》",
      "note": "paraphrase"
    },
    {
      "text": "设计更完美的人类之前，先问谁有权定义完美。",
      "author": "玛格丽特·阿特伍德",
      "source": "《羚羊与秧鸡》",
      "note": "paraphrase"
    },
    {
      "text": "世界终结不是一瞬间，而是被忽视的裂缝不断生长。",
      "author": "N·K·杰米辛",
      "source": "《第五季》",
      "note": "paraphrase"
    },
    {
      "text": "智慧可以长出不同形状，理解不该只模仿人类。",
      "author": "阿德里安·柴可夫斯基",
      "source": "《时间之子》",
      "note": "paraphrase"
    },
    {
      "text": "在火星活下去，靠的不是英雄主义而是逐项求解。",
      "author": "安迪·威尔",
      "source": "《火星救援》",
      "note": "paraphrase"
    },
    {
      "text": "跨越群星的友谊，始于愿意学习彼此的语言。",
      "author": "安迪·威尔",
      "source": "《挽救计划》",
      "note": "paraphrase"
    },
    {
      "text": "宇宙若传来回声，倾听本身就是文明的勇气。",
      "author": "卡尔·萨根",
      "source": "《接触》",
      "note": "paraphrase"
    },
    {
      "text": "把孩子训练成武器，会让胜利留下漫长的阴影。",
      "author": "奥森·斯科特·卡德",
      "source": "《安德的游戏》",
      "note": "paraphrase"
    },
    {
      "text": "朝圣者各自讲述的故事，拼成了未来的真相。",
      "author": "丹·西蒙斯",
      "source": "《海伯利安》",
      "note": "paraphrase"
    },
    {
      "text": "真正丰裕的文明，不必用占有证明自身价值。",
      "author": "伊恩·M·班克斯",
      "source": "《玩家》",
      "note": "paraphrase"
    },
    {
      "text": "武器记住每次使用它的人，也记住被抹去的人。",
      "author": "伊恩·M·班克斯",
      "source": "《武器浮生录》",
      "note": "paraphrase"
    },
    {
      "text": "星际废墟并非沉默，它们只是用深时间说话。",
      "author": "阿拉斯泰尔·雷诺兹",
      "source": "《启示空间》",
      "note": "paraphrase"
    },
    {
      "text": "意识也许不是智慧的顶点，只是演化的一种代价。",
      "author": "彼得·沃茨",
      "source": "《盲视》",
      "note": "paraphrase"
    },
    {
      "text": "复制一颗心并不能回答，哪一个才算真正活着。",
      "author": "格雷格·伊根",
      "source": "《排列城市》",
      "note": "paraphrase"
    },
    {
      "text": "当宇宙服从数学，观察者仍要选择如何存在。",
      "author": "格雷格·伊根",
      "source": "《祈祷之海》",
      "note": "paraphrase"
    },
    {
      "text": "身体内部的微小革命，也可能重写整个物种。",
      "author": "格雷格·贝尔",
      "source": "《血音乐》",
      "note": "paraphrase"
    },
    {
      "text": "宏伟造物最先提出的问题，是它为何空无一人。",
      "author": "拉里·尼文",
      "source": "《环形世界》",
      "note": "paraphrase"
    },
    {
      "text": "通往群星的门票，也可能是一生无法偿还的债。",
      "author": "弗雷德里克·波尔",
      "source": "《通往宇宙之门》",
      "note": "paraphrase"
    },
    {
      "text": "复仇推动飞船向前，却不能告诉灵魂去往何处。",
      "author": "阿尔弗雷德·贝斯特",
      "source": "《群星，我的归宿》",
      "note": "paraphrase"
    },
    {
      "text": "恒星间的争夺越宏大，个人选择就越不可替代。",
      "author": "塞缪尔·德莱尼",
      "source": "《新星》",
      "note": "paraphrase"
    },
    {
      "text": "语言不仅描述异星，也决定我们能否与它相遇。",
      "author": "柴纳·米耶维",
      "source": "《大使城》",
      "note": "paraphrase"
    },
    {
      "text": "被创造来完成使命的生命，也拥有追问命运的权利。",
      "author": "石黑一雄",
      "source": "《别让我走》",
      "note": "paraphrase"
    },
    {
      "text": "文明崩塌之后，艺术仍提醒我们生存不止于呼吸。",
      "author": "艾米莉·圣约翰·曼德尔",
      "source": "《第十一站》",
      "note": "paraphrase"
    },
    {
      "text": "越接近技术奇点，人类越需要重新定义人的位置。",
      "author": "弗诺·文奇",
      "source": "《深渊上的火》",
      "note": "paraphrase"
    },
    {
      "text": "帮助另一个物种成长，也是文明检验自身的方式。",
      "author": "大卫·布林",
      "source": "《提升之战》",
      "note": "paraphrase"
    },
    {
      "text": "历史旅程最难修复的，常是一个微小而善意的决定。",
      "author": "康妮·威利斯",
      "source": "《末日之书》",
      "note": "paraphrase"
    },
    {
      "text": "改造火星之前，人类必须先决定要成为什么文明。",
      "author": "金·斯坦利·罗宾逊",
      "source": "《红火星》",
      "note": "paraphrase"
    },
    {
      "text": "水比黄金更珍贵时，权力会暴露最真实的形状。",
      "author": "保罗·巴奇加卢皮",
      "source": "《掣水记》",
      "note": "paraphrase"
    },
    {
      "text": "一个只想独处的机器，也可能比人类更懂得保护。",
      "author": "玛莎·威尔斯",
      "source": "《异星危机》",
      "note": "paraphrase"
    },
    {
      "text": "身份被分散到许多身体后，正义仍要求一个回答。",
      "author": "安·莱基",
      "source": "《正义辅助》",
      "note": "paraphrase"
    },
    {
      "text": "穿越漫长星路之后，家仍由彼此的选择组成。",
      "author": "贝姬·钱伯斯",
      "source": "《漫长的中转星系》",
      "note": "paraphrase"
    }
  ]
};

  Object.keys(library).forEach(function (kind) {
    library[kind].forEach(Object.freeze);
    Object.freeze(library[kind]);
  });

  window.CMQuoteLibrary = Object.freeze(library);
})();
