var ol = ol || {};

ol.firebase = (function()
{
	let searchTerms = new Firebase('https://culinarian-a7d11.firebaseio.com/');
	
	let database = ol.mainVue.firePoint;
	
	function pushOnFire(query = '')
	{
		//let temp2 = temp.charAt(0).toUpperCase() + temp.slice(1);
		//query = temp2;
		// check the database to see if the term has been searched before
		searchTerms.child('searchTerms/' + query).once('value', function(snapshot)
		{
			if(snapshot.exists())
			{
				let count = snapshot.val().access;
				let sameName = snapshot.val().name;
				count++;
				//let str = count + '';
				firebase.database().ref('searchTerms/' + query).set({
					access 	: 	count,
					name	:	sameName
				});
			}
			else
			{
				console.log('fired');
				firebase.database().ref('searchTerms/' + query).set({
					access 	:	1,
					name	:	(query.charAt(0).toUpperCase() + query.slice(1))
				});
			}
		});
		/*firebase.database().ref('searchTerms').set(
		{
			search: query
		});*/
	}
	
	return{
		pushOnFire
	};
})();