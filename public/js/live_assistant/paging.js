/*
	Name: pager
	Access type: Public
	Description:
		Manage pager on toolbar share.
	Private properties:
		@list[object]: contain list products.
		@currentPage[int]: current page.
		@recordInPage[int]: max products in a page.
		@firstPage[int]: first page.
		@lastPage[int]: last page.
		@total[int]: total product.
		@page[int]: total page
		@block[int]: number pages display in a block.
		@wrapPager[string]: id of place display pager.
		@wrapSlider[object]: object display products in a page.
	Private functions:
		init: init pager
		createPage: create list pages.
		actionLinkPage: Calculate number products and display products in a page.
		displayProducts: display product in a page.
*/


function pager() {
	this.list = [];
	this.currentPage = '';
    this.currentNav = '';
	this.recordInPage = 4;
	this.firstPage = 0;
	this.lastPage = 0;
	this.total = 0;
	this.page = 0;
	this.block = 5;
	this.type = '';
	this.wrapPager = '';
	this.wrapSlider = null;
    this.nextBtn = $('<a id="paging-queue-pre" class="btn-paging-act" href="#">Pre</a>');
    this.preBtn = $('<a id="paging-queue-next" class="btn-paging-act" href="#">Next</a>');
    this.namePage = "queue-page";
    this.nameNav = "queue-nav";
	/*
		Parameters:
			@Object[array or json] parameter _list: list products
			@String parameter _wrapPager: id of Place display pager.
			@Object parameter _wrapSlider: jQuery object contain list products in a page.
		Returns:
			None
	*/
	this.init = function(_list, _wrapPager, _wrapSlider){
		//Assign list products.
        this.list= _list;
        //Assign total of products.
		this.total = this.list.length;
		//Assign total of pages
		this.page = (this.total % this.recordInPage == 0) ? Math.floor(this.total/this.recordInPage) : Math.floor(this.total/this.recordInPage) + 1;
		//Assign first page and last page
		if(this.page > 1)
		{
			this.lastPage = this.firstPage + this.block - 1;
			if(this.lastPage >= this.page)
				this.lastPage = this.page;
		}
		else
			this.lastPage = this.firstPage;
		//Assign wrapper of pager.
		this.wrapPager = $(_wrapPager);
		//Assign place show products in a page.
		this.wrapSlider = $(_wrapSlider);
        this.createPage();
        this.displayListCust();
        var _this = this;
        this.nextBtn.attr('href', '#'+ this.namePage+2);

        this.nextBtn.bind("click",false, function(e){
            e.preventDefault();
            var next_link = $(_this.currentNav).parent().next();
            if (next_link.html() !== null){
                _this.currentNav = next_link.find('a');
                 _this.currentNav.click();
            }
        });
        this.preBtn.attr('href', '#' + this.namePage + 1);
        this.preBtn.bind('click',false, function(e){
            e.preventDefault();
            var prev_link = $(_this.currentNav).parent().prev();
            if(prev_link.html() !== null){
                _this.currentNav = prev_link.find('a');
                _this.currentNav.click();
            }
        })
        if(this.page == 1)
            location.href = "#" + this.namePage + 1;
        else{
            $("#" + this.nameNav + sale.queueCurrentPage).click();
        }
	};
	/*
		Parameters:
			None
		Returns:
			None
	*/
	this.createPage = function(){
		var _this = this;
		//Empty wrapper pager.
		this.wrapPager.empty();
        var listPage = $('<ul id="wrp-paging-nav"></ul>');
        this.currentNav = '#' + this.nameNav + '1';
        if(this.page > 1){
            for(var i = 0; i < this.page; i++){
                if(i == 0){
                    //Create page element.
                    var wrapItems = $('<li></li>');
                    var a = $('<a id="' + this.nameNav + (i + 1) + '" class="paging-queue-items paging-queue-icon-active" href="#'+ this.namePage+(i+1)+'">&nbsp;</a>');
                    //Bind Click Event to page element.
                    a.bind('click',function(){
                        _this.currentNav = $('#'+$(this).attr('id'));
                        _this.currentPage = $(this).attr('href');
                        var next = $(this).parent().next();
                        var prev = $(this).parent().prev();
                        if (next.html() !== null) _this.nextBtn.attr('href', next.find('a').attr('href'));
                        else  _this.nextBtn.attr('href', $(this).attr('href'));
                        if (prev.html() !== null) _this.preBtn.attr('href', prev.find('a').attr('href'));
                        else _this.preBtn.attr('href', $(this).attr('href'));
                        $('.paging-queue-items').removeClass('paging-queue-icon-active').addClass('paging-queue-icon');
                        $(this).removeClass('paging-queue-icon').addClass('paging-queue-icon-active');
                        location.href = $(this).attr('href');
                        sale.queueCurrentPage = parseInt(_this.currentPage.substr(_this.currentPage.length - 1, 1));
                    });
                    //Append page element to wrapper pager.
                    listPage.append(wrapItems.append(a));
                }
                else{
                    //Create page element.
                    var wrapItems = $('<li></li>');
                    var a = $('<a id="'+this.nameNav+ (i+1)+'" class="paging-queue-items paging-queue-icon" href="#' + this.namePage + (i + 1) + '">&nbsp;</a>');
                    //Bind Click Event to page element.
                    a.bind('click', function () {
                        var ___this = this;
                        _this.currentNav = '#' + $(this).attr('id');
                        _this.currentPage = $(this).attr('href');
                        var next = $(this).parent().next();
                        var prev = $(this).parent().prev();
                        if (next.html() !== null) _this.nextBtn.attr('href', next.find('a').attr('href'));
                        else  _this.nextBtn.attr('href', $(this).attr('href'));
                        if (prev.html() !== null) _this.preBtn.attr('href', prev.find('a').attr('href'));
                        else _this.preBtn.attr('href', $(this).attr('href'));
                        $('.paging-queue-items').removeClass('paging-queue-icon-active').addClass('paging-queue-icon');
                        $(this).removeClass('paging-queue-icon').addClass('paging-queue-icon-active');
                        location.href = $(this).attr('href');
                        sale.queueCurrentPage = parseInt(_this.currentPage.substr(_this.currentPage.length -1, 1));
                    });
                    //Append page element to wrapper pager.
                    listPage.append(wrapItems.append(a));
                }
            }
            if (this.page > 1)
                this.wrapPager.append(this.preBtn).append(listPage).append(this.nextBtn);
            else
                this.wrapPager.append(listPage);
            //Show products in first page.
            //this.actionLinkPage(1);
        }
	};
	/*
		Parameters:
			@Int parameter num: index of page.
		Returns:
			None
	*/
	this.actionLinkPage = function(num){
		if(this.total > 0){
			//Calculate number of products will be displayed.
			var min = this.recordInPage * (num -1);
			var max = min + this.recordInPage - 1;
			if(max >= this.total -1)
				max = this.total -1;
			//Display products in a page.
			this.displayProducts(min, max);
		}
	};
	/*
		Parameters:
			@Int parameter min: number start of list products will be displayed.
			@Int parameter max: number end of list products will be displayed.
	*/
	this.displayListCust = function(){
        this.wrapSlider.empty();
        this.list = this.sortList(this.list);
        for(var i = 0; i < this.page; i++){
            var blockCust = $('<li id="'+this.namePage + (i + 1) + '" class="block-cust"></li>');
            var listCustDetail = $('<ul class="wrp-cust-detail"></ul>');
            for(var j = 0; j < this.recordInPage; j++){
                var index = (i * this.recordInPage) + j;
                if(this.list[index]){
                    var number = '<p class="queue-number">' + (index + 1) + '</p>';
                    var textName = (this.list[index].info.name.length > 8) ? this.list[index].info.name.substring(0, 10) + '...' : this.list[index].info.name;
                    var name = '<p class="cust-info-text">' + textName + '</p>';
                    var textId = this.list[index].id;
                    var id = '<p class="cust-info-text">' + textId + '</p>';
                    var textCt = (this.list[index].info.country)? this.list[index].info.country: 'UNKNOWN';
                    var country = '<p class="cust-country ml5">' + textCt + '</p>';
                    var mn = Math.floor(parseInt(new Date().getTime()) - parseInt(new Date(this.list[index].info.crdate).getTime()) - (sale.timegap));
                    var t= (Math.floor(mn / 60000) >=1)?Math.floor(mn/60000) + "'": 'JUST NOW' ;
                    var clock = '<p class="cust-clock ml5 icon_clock">' + t + '</p>';
                    var items = $('<li class="queue-list-items '+ this.list[index].status +'"></li>');
                    var engageBtn = $('<a id="'+ this.list[index].id+'" class="cust-engage hd" href="#"></a>');
                    engageBtn.bind('click',function(){
                        if(!sale.engaged){
                            var data  = {custId: $(this).attr('id'), saleId: sale.channelId};
                            sale.engaged = true;
                            socketEmit('engage', data);
                        }
                    });
                    items.hover(function(){
                        if(!sale.engaged && $(this).hasClass('connected'))
                            $(this).find('.cust-engage').removeClass('hd');
                    }, function(){
                        if (!sale.engaged && $(this).hasClass('connected'))
                            $(this).find('.cust-engage').addClass('hd');
                    });
                    items.append($('<div class="cust-detail"></div>').append($('<div class="cust-wrp-info"></div>')
                        .append($('<div class="cust-queue fl"></div>').append(number))
                        .append($('<div class="cust-queue fl"></div>').append(name).append(id))
                    ).append('<div class="clr"></div>').append(country).append(clock)).append(engageBtn);
                    listCustDetail.append(items);
                }
                else
                    break;
            }
            blockCust.append(listCustDetail);
            this.wrapSlider.append(blockCust);
        }
	};
    this.sortList = function(list){
        for(var i = 0; i < list[list.length]; i++){
            for(var j = list[list.length - 1]; j > i+1; j--){
                if (parseInt(list[j].status) < parseInt(list[j -1].status)){
                    var tmp = list[j];
                    list[j] = list[j - 1];
                    list[j - 1] = tmp;
                }
            }
        }
        return list;
    };

}

