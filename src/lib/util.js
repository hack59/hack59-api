/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */
export function toRes(req, res, next) {
    if(req.error){

        res.json(req.error);

    }else{

        res.json(req.result);

    }
}

export function getError(message, status = 200){

    let e = new Error();
    e.message = message;
    e.status = status;
    return e;

}
