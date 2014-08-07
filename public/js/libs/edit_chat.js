/*
	Name: Edit chat
	Access prototype: static
	Private properties:
	@btn[object]: button edit, start process edit when click on this button.
	@idChatInput[string]: id of input field where will entry content edit.
	@iconEdited[string] : icon will be appended to the text was edit.
	@idContent[string]: id of msg wrapper where will edit.
	@firstBtn: flag, determ
	Public static properties:
	@flag[boolean]: tracking process edit chat.
	
	Methods:
*/

function EditChat(id, idChatInput){
	this.btn = $('<button id="'+id+'" type="button">&nbsp;</button>');
	this.idChatInput = idChatInput;
	this.iconEdited = '<span class="icon-edit">&nbsp;</span>';
	this.firstBtn = true;
	this.idContent = '';
	this.editContent = '';
	this.tempId = "tempChatId";
};
EditChat.prototype.flag = false;
EditChat.prototype.keyUp = true;

EditChat.prototype.resetBtn = function(){
	var _this = this;
	this.btn.unbind('click');
	this.btn.bind('click', function(){
		_this.clickFn(_this);
	});
}

EditChat.prototype.moveBtnTo = function(id){
	this.editContent = $('#'+id).html();
	
	this.btn.appendTo('#'+id);
	this.idContent = id;
	this.resetBtn();
};

EditChat.prototype.editChatContent = function(id,content){
	$('#' + id).html(content);
	$('#' + id).append(this.iconEdited);
};

EditChat.prototype.selfEditContent = function(content){
	this.editContent = content;
	$('#' + this.idContent).html(this.editContent);
	$('#' + this.idContent).append(this.iconEdited);
	this.btn.appendTo('#' + this.idContent);
	$('#' + this.idContent).parent().find('#'+this.tempId).remove();
	this.flag = false;
	this.resetBtn();
};
		

EditChat.prototype.clickFn = function(_this){
	_this.flag = true;
	var temp = $('<p id="'+_this.tempId+'" style="display: none"></p>');
	$('#' + _this.idContent).parent().append(temp);
	_this.btn.appendTo('#'+ _this.tempId);
	$('#' + _this.idChatInput).focus();
	$('#' + _this.idChatInput).val(_this.editContent);
	
};



