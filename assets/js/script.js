$(function() {

	// URL初始化
	var href="";
	// 年月日时
	var ymd=getUrlParam("ymd");
	var hms=getUrlParam("hms");
	var date=new Date(moment(ymd+"T"+hms).format('YYYY/MM/DD HH:mm:ss'));
	if (!isValidDate(date)) {
		date=new Date();
		ymd=moment().format('YYYYMMDD');
		hms=moment().format('HHmmss');
		href="?ymd="+ymd+"&hms="+hms;
	}
	// 当前时间
	var weekdays={0:"日",1:"一",2:"二",3:"三",4:"四",5:"五",6:"六"};
	var weekday=weekdays[moment(date).weekday()];
	$('#current').html(moment(date).format('YYYY年MM月DD日（'+weekday+'）HH:mm:ss'));
	// 今日农历
	var now=Lunar.fromDate(date);
	var today=now.getYearInGanZhiExact()+"年"+now.getMonthInChinese()+"月"+now.getDayInChinese();
	$('#today').html(today);	
	// 本卦运算
	var gua=getUrlParam("gua");
	var regex=new RegExp(/^[6789]{6}$/);
	var benGua=[];
	if (gua && gua.match(regex)) {
		for (var i=1;i<=6;i++) {
			benGua[i]=parseInt(gua[i-1]);
		}
	} else {
		// 大衍之数五十
		var dayan=50;
		// 太极虚一不用
		var taiji=1;
		// 其用四十有九
		var yong=dayan - taiji;
		// 得出本卦
		for (var i=1;i<=6;i++) {
			// 十有八变而成卦
			benGua[i]=calcYao(yong);
		}
		href="?ymd="+ymd+"&hms="+hms+"&gua="+benGua.toString().replaceAll(",","")
	}
	if (href) {
		location.href=href;
	}

	// 变卦断占
	var bianYaoNum=0; // 变爻数量
	var guaYingNum=0; // 卦之营数
	for (var i=1;i<=6;i++) {
		if (benGua[i]==6 || benGua[i]==9) {
			bianYaoNum+=1; // 变爻数量
		}
		guaYingNum+=benGua[i]; // 卦之营数
	}
	var shouldBianYao=calcShouldBianYao(guaYingNum); // 宜变之爻
	if (bianYaoNum==0) {
		$('#tip').html('六爻皆不变，以本卦卦象卦辞断占。');
		drawThe64Gua('#ben',benGua,0);
		$('#ben').addClass('col-sm-6 offset-sm-3').removeClass('d-none');
	} else if (bianYaoNum==6) {
		var tip="六爻皆变，以之卦卦象卦辞断占，同时思考由本卦剧变为之卦的情由。";
		var isQian=true;
		var isKun=true;
		for (var i=1;i<=6;i++) {
			if (benGua[i] !=9) {
				isQian=false;
			}
			if (benGua[i] !=6) {
				isKun=false;
			}
		}
		if (isQian || isKun) {
			tip+="<br>六爻全变之本卦若为乾、坤，则以“用九”、“用六”主断占。";
		}
		$('#tip').html(tip);
		drawThe64Gua('#ben',benGua,0);
		drawThe64Gua('#bian',calcBianGua(benGua,0),0);
		$('#ben').addClass('col-sm-4 offset-sm-2').removeClass('d-none');
		$('#bian').addClass('col-sm-4').removeClass('d-none');
	} else if (bianYaoNum==1) {
		if (benGua[shouldBianYao]==9 || benGua[shouldBianYao]==6) {
			$('#tip').html('一爻变，若此爻值宜变爻位，以本卦该爻爻辞断占，同时思考由本卦变为之卦的情由。');
		} else {
			$('#tip').html('一爻变，若此爻不值宜变爻位，以本卦卦象卦辞断占，同时思考一旦变为之卦后的可能发展。');
		}
		drawThe64Gua('#ben',benGua,shouldBianYao);
		drawThe64Gua('#bian',calcBianGua(benGua,0),0);
		$('#ben').addClass('col-sm-4 offset-sm-2').removeClass('d-none');
		$('#bian').addClass('col-sm-4').removeClass('d-none');
	} else if (bianYaoNum==2) {
		if (benGua[shouldBianYao]==6 || benGua[shouldBianYao]==9) {
			$('#tip').html('二爻变，若其中一爻值宜变爻位，以本卦该爻爻辞断占，同时思考另一爻爻辞，以及宜变之爻变所得之卦的卦象卦辞、两爻齐变所得之卦的卦象卦辞同本卦卦象卦辞之间的因果关联。');
			drawThe64Gua('#ben',benGua,shouldBianYao);
			drawThe64Gua('#bian',calcBianGua(benGua,shouldBianYao),0);
			drawThe64Gua('#bian2',calcBianGua(benGua,0),0);
			$('#ben').addClass('col-sm-4').removeClass('d-none');
			$('#bian').addClass('col-sm-4').removeClass('d-none');
			$('#bian2').addClass('col-sm-4').removeClass('d-none');
		} else {
			$('#tip').html('二爻变，若两爻均非宜变之爻，以本卦卦象卦辞断占，同时思考两爻爻辞，以及两爻齐变所得之卦的卦象卦辞同本卦之间的因果关联。');
			drawThe64Gua('#ben',benGua,shouldBianYao);
			drawThe64Gua('#bian',calcBianGua(benGua,0),0);
			$('#ben').addClass('col-sm-4 offset-sm-2').removeClass('d-none');
			$('#bian').addClass('col-sm-4').removeClass('d-none');
		}
	} else if (bianYaoNum==3) {
		if (benGua[shouldBianYao]==6 || benGua[shouldBianYao]==9) {
			$('#tip').html('三爻变，若其中一爻值宜变爻位，以本卦该爻爻辞断占，同时思考宜变之爻变所得之卦的卦象卦辞、三爻齐变所得之卦的卦象卦辞同本卦之间的因果关联。');
			drawThe64Gua('#ben',benGua,shouldBianYao);
			drawThe64Gua('#bian',calcBianGua(benGua,shouldBianYao),0);
			drawThe64Gua('#bian2',calcBianGua(benGua,0),0);
			$('#ben').addClass('col-sm-4').removeClass('d-none');
			$('#bian').addClass('col-sm-4').removeClass('d-none');
			$('#bian2').addClass('col-sm-4').removeClass('d-none');
		} else {
			$('#tip').html('三爻变，若三爻均非宜变之爻，以本卦和三爻齐变所得之卦的卦象卦辞合参断占（“贞悔相争”），两卦静动相持，情势相当微妙。');
			drawThe64Gua('#ben',benGua,shouldBianYao);
			drawThe64Gua('#bian',calcBianGua(benGua,0),0);
			$('#ben').addClass('col-sm-4 offset-sm-2').removeClass('d-none');
			$('#bian').addClass('col-sm-4').removeClass('d-none');
		}
	} else if (bianYaoNum==4) {
		var tip="四爻变，以四爻齐变所得之卦的卦象卦辞断占，同时思考由本卦变为之卦的情由。";
		if (benGua[shouldBianYao]==9 || benGua[shouldBianYao]==6) {
			tip+='若其中一爻值宜变爻位，则加重考虑其爻辞。';
		}
		$('#tip').html(tip);
		drawThe64Gua('#ben',benGua,shouldBianYao);
		drawThe64Gua('#bian',calcBianGua(benGua,0),0);
		$('#ben').addClass('col-sm-4 offset-sm-2').removeClass('d-none');
		$('#bian').addClass('col-sm-4').removeClass('d-none');
	} else if (bianYaoNum==5) {
		var tip="五爻变，以五爻齐变所得之卦的卦象卦辞断占，同时思考由本卦变为之卦的情由。";
		if (benGua[shouldBianYao]==9 || benGua[shouldBianYao]==6) {
			tip+='若其中一爻值宜变爻位，则加重考虑其爻辞。';
		}
		$('#tip').html(tip);
		drawThe64Gua('#ben',benGua,shouldBianYao);
		drawThe64Gua('#bian',calcBianGua(benGua,0),0);
		$('#ben').addClass('col-sm-4 offset-sm-2').removeClass('d-none');
		$('#bian').addClass('col-sm-4').removeClass('d-none');
	}


	if (!href) {
		$('body.d-none').removeClass('d-none');
	}

});

function getUrlParam(name) {
  let url = new URL(location.href);
  return url.searchParams.get(name);
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime())
}

function getRandomInt(max) {
  return Math.floor(Math.random() * (max-1))+1;
}

function calcYao(yong) {
	// 单爻变数
	var bian=0;
	// 左堆数量
	var left=0;
	// 右堆次数
	var right=0;
	// 扐
	var le=0;
	// 三变成爻
	while (bian<3) {
		left=getRandomInt(yong);
		right=yong - left;
		le=1;
		right=right - le;
		if (right%4==0) {
			le+=4;
		} else {
			le+=right%4;
		}
		if (left%4==0) {
			le+=4;
		} else {
			le+=left%4;
		}
		yong -=le;
		bian+=1;
	}
	return yong/4;
}

function calcShouldBianYao(guaYingNum) {
	var counts=[];
	var i=0;
	while (guaYingNum+i<55) {
		if (counts.length==0) {
			counts.push(1);
		} else if (counts.length==1) {
			counts.push(2);
		} else if (counts[counts.length-1]>1 && counts[counts.length-1]<6) {
			if (counts[counts.length-1]>counts[counts.length-2]) {
				counts.push(counts[counts.length-1]+1);
			} else {
				counts.push(counts[counts.length-1]-1);
			}
		} else if (counts[counts.length-1]==6) {
				if (counts[counts.length-2]==6) {
					counts.push(5);
				} else {
					counts.push(6);
				}
		} else if (counts[counts.length-1]==1) {
				if (counts[counts.length-2]==1) {
					counts.push(2);
				} else {
					counts.push(1);
				}
		}
		i+=1;
	}
	return counts[counts.length-1];
}

function drawThe64Gua(selector,the64gua,shouldBianYao) {
	// 阴阳爻
	for (var i=1;i<=6;i++) {
		var yao="yin";
		if (the64gua[i]==7 || the64gua[i]==9) {
			var yao="yang";
		}
  	$(selector+' li:nth-child('+(7-i)+')').addClass(yao);
		if (i==shouldBianYao) {
			// 显示宜变之爻
			$(selector+' .should-bian').addClass('sb'+shouldBianYao).show();
		}
  	if (the64gua[i]==6 || the64gua[i]==9) {
  		// 显示变爻颜色
			$(selector+' li:nth-child('+(7-i)+')').addClass(yao+'-active');
			if (i==shouldBianYao) {
				// 显示宜变之爻
				$(selector+' .should-bian').addClass(yao);
			}
		}
	}
	// 内外卦名卦象
	var inGuaName=the8GuaName(the64gua[1],the64gua[2],the64gua[3]);
	var inGuaXiang=the8GuaXiang(inGuaName);
	var outGuaName=the8GuaName(the64gua[4],the64gua[5],the64gua[6]);
	var outGuaXiang=the8GuaXiang(outGuaName);
	$(selector+' .card-body h5:nth-child(1)').html(outGuaName+"（"+outGuaXiang+"）");
	$(selector+' .card-body h5:nth-child(3)').html(inGuaName+"（"+inGuaXiang+"）");
	// 全卦卦名
	var allGuaName=the64GuaName(outGuaXiang,inGuaXiang);
	$(selector+' .card-body .title').html(allGuaName['name']);
	$(selector+' .card-body .pinyin').html(allGuaName['pinyin']);
  $(selector).on("click", function() {
    window.open("https://e.23-6.site/data/?gua="+allGuaName['name'],"_blank");
  });
}

function the64GuaName(outGuaXiang,inGuaXiang) {
	var the64Guas={
		"天天":{"name":"乾","pinyin":"qián"},
		"地地":{"name":"坤","pinyin":"kūn"},
		"水雷":{"name":"屯","pinyin":"zhūn"},
		"山水":{"name":"蒙","pinyin":"méng"},
		"水天":{"name":"需","pinyin":"xū"},
		"天水":{"name":"讼","pinyin":"sòng"},
		"地水":{"name":"师","pinyin":"shī"},
		"水地":{"name":"比","pinyin":"bì"},
		"风天":{"name":"小畜","pinyin":"xiao xù"},
		"天泽":{"name":"履","pinyin":"lǚ"},
		"地天":{"name":"泰","pinyin":"tài"},
		"天地":{"name":"否","pinyin":"pǐ"},
		"天火":{"name":"同人","pinyin":"tóng rén"},
		"火天":{"name":"大有","pinyin":"dà yōu"},
		"地山":{"name":"谦","pinyin":"qiān"},
		"雷地":{"name":"豫","pinyin":"yǜ"},
		"泽雷":{"name":"随","pinyin":"suí"},
		"山风":{"name":"蛊","pinyin":"gǔ"},
		"地泽":{"name":"临","pinyin":"lín"},
		"风地":{"name":"观","pinyin":"guān"},
		"火雷":{"name":"噬嗑","pinyin":"shì hé"},
		"山火":{"name":"贲","pinyin":"bì"},
		"山地":{"name":"剥","pinyin":"bō"},
		"地雷":{"name":"复","pinyin":"fù"},
		"天雷":{"name":"无妄","pinyin":"wú wàng"},
		"山天":{"name":"大畜","pinyin":"dà xù"},
		"山雷":{"name":"颐","pinyin":"yí"},
		"泽风":{"name":"大过","pinyin":"dà guò"},
		"水水":{"name":"坎","pinyin":"kǎn"},
		"火火":{"name":"离","pinyin":"lí"},
		"泽山":{"name":"咸","pinyin":"xián"},
		"雷风":{"name":"恒","pinyin":"héng"},
		"天山":{"name":"遁","pinyin":"dùn"},
		"雷天":{"name":"大壮","pinyin":"dà zhuàng"},
		"火地":{"name":"晋","pinyin":"jìn"},
		"地火":{"name":"明夷","pinyin":"míng yí"},
		"风火":{"name":"家人","pinyin":"jiā rén"},
		"火泽":{"name":"睽","pinyin":"kuí"},
		"水山":{"name":"蹇","pinyin":"jiǎn"},
		"雷水":{"name":"解","pinyin":"xiè"},
		"山泽":{"name":"损","pinyin":"sǔn"},
		"风雷":{"name":"益","pinyin":"yì"},
		"泽天":{"name":"夬","pinyin":"guài"},
		"天风":{"name":"姤","pinyin":"gòu"},
		"泽地":{"name":"萃","pinyin":"cuì"},
		"地风":{"name":"升","pinyin":"shēng"},
		"泽水":{"name":"困","pinyin":"kùn"},
		"水风":{"name":"井","pinyin":"jǐng"},
		"泽火":{"name":"革","pinyin":"gé"},
		"火风":{"name":"鼎","pinyin":"dǐng"},
		"雷雷":{"name":"震","pinyin":"zhèn"},
		"山山":{"name":"艮","pinyin":"gèn"},
		"风山":{"name":"渐","pinyin":"jiàn"},
		"雷泽":{"name":"归妹","pinyin":"guī mèi"},
		"雷火":{"name":"丰","pinyin":"fēng"},
		"火山":{"name":"旅","pinyin":"lǚ"},
		"风风":{"name":"巽","pinyin":"xùn"},
		"泽泽":{"name":"兑","pinyin":"duì"},
		"风水":{"name":"涣","pinyin":"huàn"},
		"水泽":{"name":"节","pinyin":"jié"},
		"风泽":{"name":"中孚","pinyin":"zhōng fú"},
		"雷山":{"name":"小过","pinyin":"xiǎo guò"},
		"水火":{"name":"既济","pinyin":"jì jì"},
		"火水":{"name":"未济","pinyin":"wèi jì"},
	};
	return the64Guas[outGuaXiang+inGuaXiang];
}

function the8GuaName(chu,er,shang) {
	var gua=[];
	var the8Guas={		
		"yang":{
			"yang":{
				"yang":"乾",
				"yin":"兑",
			},
			"yin":{
				"yang":"离",
				"yin":"震",
			},
		},
		"yin":{
			"yang":{
				"yang":"巽",
				"yin":"坎",
			},
			"yin":{
				"yang":"艮",
				"yin":"坤",
			},
		},
	};
	gua[1]="yin";
	if (chu==7 || chu==9) {
		gua[1]="yang";
	}
	gua[2]="yin";
	if (er==7 || er==9) {
		gua[2]="yang";
	}
	gua[3]="yin";
	if (shang==7 || shang==9) {
		gua[3]="yang";
	}
	return the8Guas[gua[1]][gua[2]][gua[3]]
}

function the8GuaXiang(guaName) {
	var guasXiang={
		"乾":"天","兑":"泽","离":"火","震":"雷",
		"巽":"风","坎":"水","艮":"山","坤":"地",
	};
	return guasXiang[guaName];
}

function calcBianGua(benGua,shouldBianYao) {
	var bianGua=[];
	for (var i=1;i<=6;i++) {
		if (shouldBianYao==0) {
			bianGua[i]=benGua[i];
			if (benGua[i]==6) {
				bianGua[i]=9;
			} else if (benGua[i]==9) {
				bianGua[i]=6;
			}
		} else if (shouldBianYao>0) {
			bianGua[i]=benGua[i];
			if (benGua[i]==6) {
				if (i==shouldBianYao) {					
					bianGua[i]=9;
				} else {
					bianGua[i]=8;
				}
			} else if (benGua[i]==9) {
				if (i==shouldBianYao) {					
					bianGua[i]=6;
				} else {
					bianGua[i]=7;
				}
			}
		}
	}
	return bianGua;
}
