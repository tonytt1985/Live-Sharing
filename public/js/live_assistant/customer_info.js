/*
	Name: custInfo
	Description: store and manage customer information.
	Access type: public
	Properties:
	Function:
		save:
			Parameters:
			Returns:
		viewSupportInfo:
			Parameters:
			Returns:
		viewBasicInfo:
			Parameters:
			Returns:
		viewGeoipInfo:
			Parameters:
			Returns:
*/

var custInfo = (function(){
	return function(support, basic, geoip){
		var _basicInfo = basic;
		var _geoipInfo = geoip;
		this.setBasicInfo = function(basic){
			_basicInfo = basic;
			return true;
		};
		this.getBasicInfo = function(){
			return _basicInfo;
		};
		this.updateBasicInfo = function(){
			$.each(_basicInfo, function(key, val){
				_basicInfo[key] = $('[name='+key+']').val();
			});
		};
		this.filterBasicInfo = function(){
			$.each(_basicInfo, function(key, value){
				if($('[name='+key+']').attr('type') !== 'hidden')
					$('[name='+key+']').val(value);
			});
		};
		this.updateBasicValue = function(key, value){
			_basicInfo[key] = value;
		}
		
		this.setGeoipInfo = function(geoip){
			_geoipInfo = geoip;
			return true;
		};
		this.getGeoipInfo = function(){
			return _geoipInfo;
		};
		
		this.resetForm = function(){
			$.each(_basicInfo, function(key, val){
				if($('[name='+key+']').attr('type') !== 'hidden')
					$('[name='+key+']').val("");
			});
		};
	};
})();