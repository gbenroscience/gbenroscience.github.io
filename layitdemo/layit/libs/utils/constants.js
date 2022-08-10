/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */








const WINDOWS = 1;
const OS_X = 2;
const UNIX = 3;







const HTTP_CODES = {
    SUCCESS: 200,
    ACCOUNT_CLOSED: 410,
    CREATED: 201,
    CONFLICT: 409,
    FAILURE: -1,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    AUTH_REQUIRED: 401,
    TIMEOUT: 408,
    DUPLICATE: 409,
    PRECONDITION_FAILED: 412,
    SERVER_DOWN: 502,
    SERVER_ERROR: 500
};

const SERVER_CODES = {
    DUPLICATE: -2,
    ERROR: -1,
    PENDING: 0,
    SUCCESSFUL: 1
};

/**
 * 
 * @type {{CLOSING: number, UPSTREAM: number, OPENING: number, ERROR: number}}
 */
const NOTIF_TYPES = {
    ERROR: -1,
    UPSTREAM: 1,
    OPENING: 0,
    CLOSING: 2
};

const WS_CODES = {
    NORMAL_CLOSE: 1000, //– the default, normal closure (used if no code supplied),
    UNDEFINED_CLOSE: 1006, //– no way to set such code manually, indicates that the connection was lost (no close frame).
    PEER_CLOSE: 1001, //– the party is going away, e.g. server is shutting down, or a browser leaves the page,
    PACKET_TOO_LARGE: 1009,// – the message is too big to process,
    SERVER_ERROR: 1011//– unexpected error on server,
};

/**
 * flag types of messages from the websocket server
 * @type {{CHUNK_ACK: number, SUCCESS: number, DISCONNECTED: number, PROGRESS: number, CONNECTED: number, ERROR: number}}
 */
const WS_FLAGS = {
    ERROR: -1,
    PROGRESS: 0,
    SUCCESS: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
    CHUNK_ACK: 4,//acknowledge the receipt of a chunk
    FILE_OPENED: 5
};




const WS_PORT = 8082;

const WS_BUFFER_SIZE = 16*1024;
const WS_START_UPLOAD = 'start_file_upload';
const WS_NEW_FILE_UPLOAD = 'new_file_upload';
const WS_PAUSE_UPLOAD = 'pause_file_upload';
const WS_STOP_UPLOAD = 'stop_file_upload';



const UI_WORKET_FLAGS = {
    SOCKET_OPEN: 1,
    SOCKET_CLOSE: 2
};


