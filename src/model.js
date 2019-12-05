


/*

 - Add break



type Break struct {
    Name string
    Every time.Duration
    Duration  time.Duration
    Actions []Action
}

type Action struct {
    Name string
    Handler func()
}
action.getArgs() //to get list of configuration items


class Overlay extends Action {
    function getInfo(){
        return {
            name: "Overlay",
        }
    }
    function init(){
        
    }

    function setOptions(opts){
        //Use opts to set stuff in db
    }

    //Used to show fields on UI
    function getOptions(){
        return [
            {
                key: 'all_monitors',
                label: 'All monitors',
                type: 'boolean',
                row: 1, //Optional
                col: 1, //Optional

            },

            {
                key: 'all_monitors'
                label: 'All monitors'
                type: 'boolean'
            }
        ]
    }
}


- add break
    - set name
    - set repeat, duration
    - add action
        - show overlay
        - show notification


func getNextDue() Date
*/



