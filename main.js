$(function () {

	
	//等待数字的图片加载完毕
	var imgOK = 0;
	var timer = setInterval(function() {
		$("img").each(function() {
			if(this.complete==true && $(this).isCounted!=true){
				imgOK++;
				$(this).isCounted=true;
			}
		});
		if (imgOK>=12) {
			clearInterval(timer)
			$(".loading").hide(0,function () {
				$(".container").css('visibility', 'visible');
			});
		}
	}, 50);



	//非手机竖屏时设置宽度
	if(window.screen.availWidth>=window.screen.availHeight){
		var containerWidth = window.screen.availHeight*0.65;
		$(".container").css('width', containerWidth+"px");
	}


	//用到的常量
	var cardSize = $(".grid:eq(0)").width();
	var margin = Number($(".grid:eq(0)").css("margin-left").split('p')[0]);
	var outterCardSize = cardSize+margin;
	var disappearTime = 150;
	var moveTime = 150;
	var $card_container = $(".card_container");



	//宽度自适应，修改样式表
	var ocssRules = document.styleSheets[0].cssRules||document.styleSheets[0].rules;
	//本地测试时，上一条语句可以正常读取样式表，但上传至服务器后，在某些浏览器下，会加载一个样式表（似乎用于去广告），导致读取到的是另外一个样式表，此时需要改下标为1
	if(ocssRules.length<=1){
		ocssRules = document.styleSheets[1].cssRules||document.styleSheets[1].rules;
	}
	//loading
	ocssRules[0].style.fontSize=cardSize*0.217+"px";
	//click bottom
	ocssRules[1].style.width=cardSize*1.38+"px";
	ocssRules[1].style.margin=cardSize*0.36+"px auto";
	ocssRules[1].style.fontSize=cardSize*0.217+"px";
	ocssRules[1].style.lineHeight=cardSize*0.72+"px";
	ocssRules[1].style.borderRadius=cardSize*0.072+"px";
	//card
	ocssRules[9].style.width=cardSize+"px";
	ocssRules[9].style.height=cardSize+"px";
	//cardInside
	ocssRules[10].style.width=cardSize+"px";
	ocssRules[10].style.height=cardSize+"px";
	//.position-x-x类确定
	var style = document.createElement("style");
	style.appendChild(document.createTextNode(""));
	document.head.appendChild(style);
	for(var y=0;y<4;y++){
		for(var x=0;x<4;x++){
			var sizeX = margin+outterCardSize*x;
			var sizeY = margin+outterCardSize*y;
			style.innerHTML+=".position-"+x+"-"+y+"{-webkit-transform:translate("+sizeX+"px,"+sizeY+"px);-moz-transform:translate("+sizeX+"px,"+sizeY+"px);-o-transform:translate("+sizeX+"px,"+sizeY+"px);-ms-transform:translate("+sizeX+"px,"+sizeY+"px);transform:translate("+sizeX+"px,"+sizeY+"px);}\n";
		}
	}



	// 路径对象，表示卡片移动前后的位置，如(true,3,2,1)表示将1和2的卡片移动并合并到3，若iSrc2为-1，则表示只移动一个卡片
	function Path (bMerge, iDst, iSrc1, iSrc2) {
		this.bMerge=bMerge;
		this.iDst=iDst;
		this.iSrc1=iSrc1;
		this.iSrc2=iSrc2;
	}



	//根据一行（列）的四个数据，返回一个Path数组
	function getRightPath (y) {
		var path = new Array();
		for(var x=3;x>=0;x--){
			if (num[x][y]!=0) {
				if (x==3) {
					continue;
				}else{
					//求X处数字最右边的空格或相同的数字，保存到dst
					var dst=x;
					var bMerge=false;
					while(true){
						//最右边的空格
						if (dst+1<=3 && num[dst+1][y]==0) {
							dst++;
						}else{
							//是否有相同且不是在上次移动后合并而成的数字
							if (dst+1<=3 && num[x][y]==num[dst+1][y]) {
								var canMerge=true;
								for (var i = path.length - 1; i >= 0; i--) {
									if (path[i].iDst==dst+1 && path[i].bMerge==true) {
										canMerge=false;
										break;
									};
								};
								if (canMerge==true) {
									dst++;
									bMerge=true;
								};

							};
							break;
						}
					}
					//不能向右移动
					if(dst==x){
						continue;
					}
					//右边有相同的数字
					if (bMerge==true) {
						//判断右边数字是否是这一次移动后得到的
						var bMoved = false;
						var i = path.length - 1;
						for (; i >= 0; i--) {
							if(path[i].iDst==dst){
								bMoved=true;
								break;
							}
						};
						if(bMoved==true){
							//右边数字被移动过
							path[i].iSrc2=x;
							path[i].bMerge=true;
							num[dst][y]=num[dst][y]*2;
							num[x][y]=0;
						}else{
							//右边数字未移动过
							path.push(new Path(true,dst,x,-1));
							num[dst][y]=num[dst][y]*2;
							num[x][y]=0;
						}
					}else{
						//右边没有相同的数字
						path.push(new Path(false,dst,x,-1));
						num[dst][y]=num[x][y];
						num[x][y]=0;
					}
				}
			};
		}
		return path;
	}
	function getLeftPath (y) {
		var path = new Array();
		for(var x=0;x<=3;x++){
			if (num[x][y]!=0) {
				if (x==0) {
					continue;
				}else{
					//求X处数字最右边的空格或相同的数字，保存到dst
					var dst=x;
					var bMerge=false;
					while(true){
						//最左边的空格
						if (dst-1>=0 && num[dst-1][y]==0) {
							dst--;
						}else{
							//是否有相同且不是在上次移动后合并而成的数字
							if (dst-1>=0 && num[x][y]==num[dst-1][y]) {
								var canMerge=true;
								for (var i = path.length - 1; i >= 0; i--) {
									if (path[i].iDst==dst-1 && path[i].bMerge==true) {
										canMerge=false;
										break;
									};
								};
								if (canMerge==true) {
									dst--;
									bMerge=true;
								};

							};
							break;
						}
					}
					//不能向左移动
					if(dst==x){
						continue;
					}
					//左边有相同的数字
					if (bMerge==true) {
						//判断左边数字是否是这一次移动后得到的
						var bMoved = false;
						var i = path.length - 1;
						for (; i >= 0; i--) {
							if(path[i].iDst==dst){
								bMoved=true;
								break;
							}
						};
						if(bMoved==true){
							//左边数字被移动过
							path[i].iSrc2=x;
							path[i].bMerge=true;
							num[dst][y]=num[dst][y]*2;
							num[x][y]=0;
						}else{
							//左边数字未移动过
							path.push(new Path(true,dst,x,-1));
							num[dst][y]=num[dst][y]*2;
							num[x][y]=0;
						}
					}else{
						//左边没有相同的数字
						path.push(new Path(false,dst,x,-1));
						num[dst][y]=num[x][y];
						num[x][y]=0;
					}
				}
			};
		}
		return path;
	}
	function getUpPath (x) {
		var path = new Array();
		for(var y=0;y<=3;y++){
			if (num[x][y]!=0) {
				if (y==0) {
					continue;
				}else{
					//求y处数字最上边的空格或相同的数字，保存到dst
					var dst=y;
					var bMerge=false;
					while(true){
						//最上边的空格
						if (dst-1>=0 && num[x][dst-1]==0) {
							dst--;
						}else{
							//是否有相同且不是在上次移动后合并而成的数字
							if (dst-1>=0 && num[x][y]==num[x][dst-1]) {
								var canMerge=true;
								for (var i = path.length - 1; i >= 0; i--) {
									if (path[i].iDst==dst-1 && path[i].bMerge==true) {
										canMerge=false;
										break;
									};
								};
								if (canMerge==true) {
									dst--;
									bMerge=true;
								};
							};
							break;
						}
					}
					//不能向上移动
					if(dst==y){
						continue;
					}
					//上边有相同的数字
					if (bMerge==true) {
						//判断上边数字是否是这一次移动后得到的
						var bMoved = false;
						var i = path.length - 1;
						for (; i >= 0; i--) {
							if(path[i].iDst==dst){
								bMoved=true;
								break;
							}
						};
						if(bMoved==true){
							//上边数字被移动过
							path[i].iSrc2=y;
							path[i].bMerge=true;
							num[x][dst]=num[x][dst]*2;
							num[x][y]=0;
						}else{
							//上边数字未移动过
							path.push(new Path(true,dst,y,-1));
							num[x][dst]=num[x][dst]*2;
							num[x][y]=0;
						}
					}else{
						//上边没有相同的数字
						path.push(new Path(false,dst,y,-1));
						num[x][dst]=num[x][y];
						num[x][y]=0;
					}
				}
			};
		}
		return path;
	}
	function getDownPath (x) {
		var path = new Array();
		for(var y=3;y>=0;y--){
			if (num[x][y]!=0) {
				if (y==3) {
					continue;
				}else{
					//求y处数字最上边的空格或相同的数字，保存到dst
					var dst=y;
					var bMerge=false;
					while(true){
						//最下边的空格
						if (dst+1<=3 && num[x][dst+1]==0) {
							dst++;
						}else{
							//是否有相同且不是在下次移动后合并而成的数字
							if (dst+1<=3 && num[x][y]==num[x][dst+1]) {
								var canMerge=true;
								for (var i = path.length - 1; i >= 0; i--) {
									if (path[i].iDst==dst+1 && path[i].bMerge==true) {
										canMerge=false;
										break;
									};
								};
								if (canMerge==true) {
									dst++;
									bMerge=true;
								};
							};
							break;
						}
					}
					//不能向下移动
					if(dst==y){
						continue;
					}
					//下边有相同的数字
					if (bMerge==true) {
						//判断下边数字是否是这一次移动后得到的
						var bMoved = false;
						var i = path.length - 1;
						for (; i >= 0; i--) {
							if(path[i].iDst==dst){
								bMoved=true;
								break;
							}
						};
						if(bMoved==true){
							//下边数字被移动过
							path[i].iSrc2=y;
							path[i].bMerge=true;
							num[x][dst]=num[x][dst]*2;
							num[x][y]=0;
						}else{
							//下边数字未移动过
							path.push(new Path(true,dst,y,-1));
							num[x][dst]=num[x][dst]*2;
							num[x][y]=0;
						}
					}else{
						//下边没有相同的数字
						path.push(new Path(false,dst,y,-1));
						num[x][dst]=num[x][y];
						num[x][y]=0;
					}
				}
			};
		}
		return path;
	}

	//随机创建一个"2"或者"4",比例8:2
	function createCard() {
		var emptyGridIndex = new Array();
		for(var y=0;y<=3;y++){
			for(var x=0;x<=3;x++){
				if (num[x][y]==0) {
					emptyGridIndex.push(4*y+x);
				};
			}
		}
		var newCardIndex = emptyGridIndex[Math.floor(Math.random()*(emptyGridIndex.length))];
		var newCardIndexX = newCardIndex%4;
		var newCardIndexY = Math.floor(newCardIndex/4);
		if (Math.random()<0.8) {
			$card_container.append('<div class="card position-'+newCardIndexX+'-'+newCardIndexY+'"><div class="appear cardInside num2 "></div></div>');
			num[newCardIndex%4][Math.floor(newCardIndex/4)]=2;
		}else{
			$card_container.append('<div class="card position-'+newCardIndexX+'-'+newCardIndexY+'"><div class="appear cardInside num4 "></div></div>');
			num[newCardIndex%4][Math.floor(newCardIndex/4)]=4;
		}
		
		emptyGridIndex = null;
	}



	//重新开始游戏
	function restart () {
		if (!confirm("确定要重新开始吗?")) {
			return;
		};
		$(".card").remove();
		setTimeout(function () {
			$(".card").remove();
			for (var x = 0; x < 4; x++) {
									for(var y=0; y<4; y++){
										num[x][y]=0;
									}
								};
								for(var i=0;i<=(Math.floor(Math.random()*2));i++){
									createCard();
								}
		},disappearTime);
	}



	//4*4图初始化
	num = new Array();
	for (var x = 0; x < 4; x++) {
		num[x] = new Array();
		for(var y=0; y<4; y++){
			num[x][y]=0;
		}
	};



	//随机创建1~2个"2"或"4"
	for(var i=0;i<=(Math.floor(Math.random()*2));i++){
		createCard();
	}



	//监听按键
	$(document).keydown(function(event) {
		$(".remove").remove();

		//对卡片2删除appear类，防止对元素再次修改类属性时，重复应用appear动画
		$(".appear").removeClass('appear');
		//保证pop的元素在上层，不是pop的元素在下层
		$(".card").css('z-index', '2');
		//检测是否GAMEOVER
		var cardCount = 0;
		for (var x = 0; x < 4; x++) {
			for(var y=0; y<4; y++){
				if (num[x][y]!=0) {cardCount++};
			}
		};
		if (cardCount==16) {
			//row
			var gameOver=true;
			for(var y=0;y<=3;y++){
				for(var x=0;x<=2;x++){
					if(num[x][y]==num[x+1][y]){
						gameOver=false;
						break;
					}
				}
			}
			//col
			for(var x=0;x<=3;x++){
				for(var y=0;y<=2;y++){
					if(num[x][y]==num[x][y+1]){
						gameOver=false;
						break;
					}
				}
			}
			
			if(gameOver==true){
				alert("GameOver");
				restart();
			}
		};

		var allPath = new Array();
		if (event.keyCode==38) {//up
			for(var x=0;x<=3;x++){
				allPath.push(getUpPath(x));
			}
			for(var i=0;i<4;i++){
				for (var j = 0; j < allPath[i].length; j++) {//这里要特别注意，从哪里到哪里和循环递增还是递减是有关系的
					var iSrc1 = allPath[i][j].iSrc1;
					var iSrc2 = allPath[i][j].iSrc2;
					var iDst = allPath[i][j].iDst;
					var $card1 = $(".position-"+i+"-"+iSrc1);
					var $card2 = $(".position-"+i+"-"+iSrc2);
					var $cardDst = $(".position-"+i+"-"+iDst);
					var cardNum = $card1.children().attr('class').split("num")[1];
					if (allPath[i][j].bMerge==false && allPath[i][j].iSrc2==-1) {
						//处理单纯移动（不合并）的Path
						$card1.attr('class', "card position-"+i+"-"+iDst);
					}else if(allPath[i][j].iSrc2==-1){
						//处理单个移动合并的Path
						$card1.css('z-index', '3')
						.attr('class', "card position-"+i+"-"+iDst)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+Number(cardNum*2));
						$cardDst.addClass('remove');
					}else{
						//处理两个移动的Path
						$card1.attr('class', "card position-"+i+"-"+iDst)
						.addClass('remove');
						$card2.css('z-index', '3')
						.attr('class', "card position-"+i+"-"+iDst)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+Number(cardNum*2));
					}
					setTimeout(function () {
						$(".pop").removeClass("pop");
					},300);
				};
			}
		}
		else if(event.keyCode==40){//down
			for(var x=0;x<=3;x++){
				allPath.push(getDownPath(x));
			}
			for(var i=0;i<4;i++){
				for (var j = 0; j < allPath[i].length; j++) {//这里要特别注意，从哪里到哪里和循环递增还是递减是有关系的
					var iSrc1 = allPath[i][j].iSrc1;
					var iSrc2 = allPath[i][j].iSrc2;
					var iDst = allPath[i][j].iDst;
					var $card1 = $(".position-"+i+"-"+iSrc1);
					var $card2 = $(".position-"+i+"-"+iSrc2);
					var $cardDst = $(".position-"+i+"-"+iDst);
					var cardNum = $card1.children().attr('class').split("num")[1];
					var cardNum_2 = cardNum*2;
					if (allPath[i][j].bMerge==false && allPath[i][j].iSrc2==-1) {
						//处理单纯移动（不合并）的Path
						$card1.attr('class', "card position-"+i+"-"+iDst);
					}else if(allPath[i][j].iSrc2==-1){
						//处理单个移动合并的Path
						$card1.css('z-index', '3')
						.attr('class', "card position-"+i+"-"+iDst)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+cardNum_2);
						$cardDst.addClass('remove');
					}else{
						//处理两个移动的Path
						$card1.attr('class', "card position-"+i+"-"+iDst)
						.addClass('remove');
						$card2.css('z-index', '3')
						.attr('class', "card position-"+i+"-"+iDst)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+cardNum_2);
					}
					setTimeout(function () {
						$(".pop").removeClass("pop");
					},300);
				};
			}
		}
		else if(event.keyCode==37){//left
			for(var y=0;y<=3;y++){
				allPath.push(getLeftPath(y));
			}
			for(var i=0;i<4;i++){
				for (var j = 0; j < allPath[i].length; j++) {//这里要特别注意，从哪里到哪里和循环递增还是递减是有关系的
					var iSrc1 = allPath[i][j].iSrc1;
					var iSrc2 = allPath[i][j].iSrc2;
					var iDst = allPath[i][j].iDst;
					var $card1 = $(".position-"+iSrc1+"-"+i);
					var $card2 = $(".position-"+iSrc2+"-"+i);
					var $cardDst = $(".position-"+iDst+"-"+i);
					var cardNum = $card1.children().attr('class').split("num")[1];
					if (allPath[i][j].bMerge==false && allPath[i][j].iSrc2==-1) {
						//处理单纯移动（不合并）的Path
						$card1.attr('class', "card position-"+iDst+"-"+i);
					}else if(allPath[i][j].iSrc2==-1){
						//处理单个移动合并的Path
						$card1.css('z-index', '3')
						.attr('class', "card position-"+iDst+"-"+i)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+Number(cardNum*2));
						$cardDst.addClass('remove');
					}else{
						//处理两个移动的Path
						$card1.attr('class', "card position-"+iDst+"-"+i)
						.addClass('remove');
						$card2.css('z-index', '3')
						.attr('class', "card position-"+iDst+"-"+i)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+Number(cardNum*2));
					}
					setTimeout(function () {
						$(".pop").removeClass("pop");
					},300);
				};
			}
		}
		else if(event.keyCode==39){//right
			for(var y=0;y<=3;y++){
				allPath.push(getRightPath(y));
			}
			for(var i=0;i<4;i++){
				for (var j = 0; j < allPath[i].length; j++) {//这里要特别注意，从哪里到哪里和循环递增还是递减是有关系的
					var iSrc1 = allPath[i][j].iSrc1;
					var iSrc2 = allPath[i][j].iSrc2;
					var iDst = allPath[i][j].iDst;
					var $card1 = $(".position-"+iSrc1+"-"+i);
					var $card2 = $(".position-"+iSrc2+"-"+i);
					var $cardDst = $(".position-"+iDst+"-"+i);
					var cardNum = $card1.children().attr('class').split("num")[1];
					if (allPath[i][j].bMerge==false && allPath[i][j].iSrc2==-1) {
						//处理单纯移动（不合并）的Path
						$card1.attr('class', "card position-"+iDst+"-"+i);
					}else if(allPath[i][j].iSrc2==-1){
						//处理单个移动合并的Path
						$card1.css('z-index', '3')
						.attr('class', "card position-"+iDst+"-"+i)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+Number(cardNum*2));
						$cardDst.addClass('remove');
					}else{
						//处理两个移动的Path
						$card1.attr('class', "card position-"+iDst+"-"+i)
						.addClass('remove');
						$card2.css('z-index', '3')
						.attr('class', "card position-"+iDst+"-"+i)
						.children()
						.addClass('pop')
						.removeClass('num'+cardNum)
						.addClass('num'+Number(cardNum*2));
					}
					setTimeout(function () {
						$(".pop").removeClass("pop");
					},300);
				};
			}
		}
		//创建新卡片
		for (var i = 0; i < allPath.length; i++) {
			if(allPath[i].length>0){
				createCard();
				break;
			}
		};
		// return false;//禁用方向键控制屏幕移动
	});


	$("#click").click(function(event) {
		restart();
	});





	//触屏操作
	var touchStart = {pageX:0,pageY:0};
	var touchEnd = {pageX:0,pageY:0};
	document.addEventListener("touchstart",function (event) {
		event.preventDefault();
		var touch = event.touches[0];
		touchStart.pageX = touch.clientX;
		touchStart.pageY = touch.clientY;
	},false);
	document.addEventListener("touchend",function (event) {
		event.preventDefault();
		var touch = event.changedTouches[0];
		touchEnd.pageX = touch.clientX;
		touchEnd.pageY = touch.clientY;
		if (touchStart.pageY-touchEnd.pageY>Math.abs(touchStart.pageX-touchEnd.pageX)) {
			var e = jQuery.Event("keydown");
			e.keyCode = 38;
			$(document).triggerHandler(e);
		}else if (touchEnd.pageY-touchStart.pageY>Math.abs(touchStart.pageX-touchEnd.pageX)) {
			var e = jQuery.Event("keydown");
			e.keyCode = 40;
			$(document).triggerHandler(e);
		}else if (touchStart.pageX-touchEnd.pageX>Math.abs(touchStart.pageY-touchEnd.pageY)) {
			var e = jQuery.Event("keydown");
			e.keyCode = 37;
			$(document).triggerHandler(e);
		}else if (touchEnd.pageX-touchStart.pageX>Math.abs(touchStart.pageY-touchEnd.pageY)) {
			var e = jQuery.Event("keydown");
			e.keyCode = 39;
			$(document).triggerHandler(e);
		}
	},false);
	$("#click").bind('touchend', function(event) {
		restart();
	});
})