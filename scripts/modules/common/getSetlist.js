// async indexeddb wrapper https://github.com/jakearchibald/idb
import { openDB, deleteDB, wrap, unwrap } from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

/**
 * Asynchronously retreive current setlist from database
 * @returns {IDBObjectStore} - setlist retrieved from database
 */
const getSetlist = async() => {
    let db = await openDB('visDB', 1, db => {
        if (db.oldVersion == 0) {
            console.log(`Error opening database: ${err.message}`);
            return null;
        }
    });
    return await db.getAll('setlist')
}

// https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
/**
 * Orders setlist array according to position property of track object
 * @param {array} setlist - array of track objects
 * @returns {array} - sorted array
 */
const sortSetlistByOrder = (setlist) => {
    return [...setlist].sort((a, b) => a.position - b.position);
}

export { getSetlist, sortSetlistByOrder }