import { useState } from "react";

function CheckBoxGrafikart(){
    const [isTermAccepted , setIsTermAccepted ] = useState(false)

    function myF(par){
        console.log('toto')
        setIsTermAccepted(par)
    }

    return (
        <form >
            <CGUCheckbox checked={isTermAccepted} onCheck={myF}/>
            {<button className={`${isTermAccepted ? "-left-100"  : "left-0" } relative border p-4 
                transition  duration-1000 ease-in-ou t 
                
                `} > Envoyer le formulaire </button>}
            <h1>{isTermAccepted ? "True" : "false"}</h1>

        </form>
    )

}



function CGUCheckbox({checked , onCheck}){
    return (
        <div className="border p-4">
            <label>
                <input 
                    type="checkbox"
                    
                    onChange = {(e)=>{
                        console.log(e)
                        return onCheck(e.target.checked)}}
                />
                Accepter les conditions
            </label>
        </div>
    )
}




export default CheckBoxGrafikart;