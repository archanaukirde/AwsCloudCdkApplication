import axios from 'axios';
import {getToken} from '../../common/src/tokenRetriever';
import {getFRToken} from '../../common/src/tokenRetriever1';
import {getCorrUrl, getFinproUrl,getPolicyDomainUrl} from '../../common/src/urlUtils';

exports.handler=async (event:{arguments:{policyNumber:any;};})=>{

try{
   const policyNumber=event.arguments.policyNumber;
   const corrend=`${getCorrUrl()}/insu/details`;
   const corrheaders={
       Authorization:'Bearer '+(await getToken()),
	   'Content-Type':'application/json',
	   schema:'DB2',
   };
   const querystring=`policyNumber=${policyNumber}`;
   const corrUrl=`${corrend}?${querystring}`;
   const corrDataresponse=await axios.get(corrUrl, {headers:corrheaders});
   
   const headers1={
       Authorization:'Bearer '+(await getFRToken()),
	   'Content-Type':'application/json'
   };
   const poliend=`${getPolicyDomainUrl()}/insu/polidetails`;
    const poliUrl=`${poliend}/${policyNumber}`;
  const poliPromise=axios.get(poliUrl, {headers: headers1);
  
   const finend=`${getPolicyDomainUrl()}/insu/findetails`;
    const finUrl=`${finend}?${policyNumber}`;
  const finPromise=axios.get(finUrl, {headers: headers1);
   
   const [poliResp, finResp]=await promise.all([poliPromise, finPromise]);
   
   const productCode=poliResp.data.productId;
   
   const querystring11=`productCode=${productCode}`;
   const prodUrl=`${corrend}?${querystring11}`;
   const prodponse=await axios.get(prodUrl, {headers:corrheaders});
   
   const response={
   corrDataresponse:corrDataresponse.data,
   poliResp:poliResp.data,
   finResp: finResp.data,
   prodponse:prodponse.data
   }

   
}catch(err){
 if (axios.isAxiosError(err)) {
   throw err.response.data;
 }else if(err.request){
    throw err.request;
 }
}

}
