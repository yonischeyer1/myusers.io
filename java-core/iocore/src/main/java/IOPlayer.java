import com.google.gson.Gson;

import java.awt.*;
import java.awt.event.InputEvent;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

import static java.awt.event.KeyEvent.*;

public class IOPlayer {
    Robot robot;
    int clickCounter;
    long timeFromPressToRelease;
    EyesApi eyesApi;
    ArrayList<String> pressesTimeStamps;
    ArrayList<String> releasesTimeStamps;
    HashMap<String, ArrayList<String>> responseObj;
    public IOPlayer() throws AWTException {
        clickCounter = 0;
        robot = new Robot();
        eyesApi = new EyesApi();
        pressesTimeStamps = new ArrayList<>();
        releasesTimeStamps = new ArrayList<String>();
        responseObj = new HashMap<>();
    }
    public void replayIOFile(String fileName) throws IOException, AWTException, InterruptedException {
//        String isCorrectImage = eyesApi.getIsCorrectImage();
        Gson gson = new Gson();
        BufferedReader br = new BufferedReader(
                new FileReader(fileName));
        IOFile ioFile = gson.fromJson(br, IOFile.class);
        ArrayList<IOAction> ioActions = ioFile.getIoActions();
        robot.mouseMove(0, 0);
        for (int i = 0; i < ioActions.size(); i++) {
            IOAction ioAction = ioActions.get(i);
            playIOAction(ioAction, "player");
        }
        Thread.sleep(1000);
        System.exit(0);
    }

    public void mousePress(int button, String mode) {
        clickCounter += 1;
        int mouseButtonClick = InputEvent.getMaskForButton(button);
        if(mode.equals("recorder")) {
            pressesTimeStamps.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss").format(new Date()).toString());
        }
        robot.mousePress(mouseButtonClick);
        robot.delay(75);
    }

    public void mouseRelease(int button, String mode) {
        int mouseButtonClick = InputEvent.getMaskForButton(button);
        robot.mouseRelease(mouseButtonClick);
        if(mode.equals("recorder")) {
            releasesTimeStamps.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss").format(new Date()).toString());
        }
        robot.delay(75);
    }

    public void mouseWheel(int amount) {
        robot.mouseWheel(amount);
        robot.delay(75);
    }

    private boolean attemptFindImage(String actionId) throws IOException, InterruptedException {
            String isCorrectImage = eyesApi.getIsCorrectImage(actionId);
            if(isCorrectImage.equals("true")) {
                return true;
            }
            return false;
    }

    public int playIOActionsRecorder(String mode, IOAction[] ioActions, String actionId) throws AWTException, IOException, InterruptedException {
        robot.mouseMove(0, 0);
        for (int i = 0; i < ioActions.length; i++) {
            IOAction ioAction = ioActions[i];
            if(mode.equals("player") && ioAction.actionType == IOAction.ActionType.MOUSE_PRESS) {
                attemptFindImage(actionId);
            } else if(mode.equals("player") && ioAction.actionType == IOAction.ActionType.KEYBOARD_TYPE && (ioAction.keyChar == '\n' || ioAction.keyChar == '\r')){
                attemptFindImage(actionId);
            }
            playIOAction(ioAction, mode);
        }
        return pressesTimeStamps.size();
    }

    public boolean playIOActions(String mode, IOAction[] ioActions, String actionId) throws AWTException, IOException, InterruptedException {
        robot.mouseMove(0, 0);
        for (int i = 0; i < ioActions.length; i++) {
            IOAction ioAction = ioActions[i];
            if(mode.equals("player") && ioAction.actionType == IOAction.ActionType.MOUSE_PRESS) {
                if(!attemptFindImage(actionId)) {
                    return false;
                }
            } else if(mode.equals("player") && ioAction.actionType == IOAction.ActionType.KEYBOARD_TYPE && (ioAction.keyChar == '\n' || ioAction.keyChar == '\r')){
                if(!attemptFindImage(actionId)) {
                    return false;
                }
            }
            playIOAction(ioAction, mode);
        }
        return true;
    }

    public void playIOAction(IOAction ioAction, String mode) throws AWTException {
        switch (ioAction.actionType){
            case MOUSE_MOVE:{
                robot.mouseMove(ioAction.x, ioAction.y);
                robot.delay(20);
                break;
            }
            case MOUSE_PRESS: {
                if(ioAction.button > -1 )  {
                    mousePress(ioAction.button, mode);
                }
                break;
            }
            case MOUSE_RELEASE: {
                if(ioAction.button > -1 )  {
                    mouseRelease(ioAction.button, mode);
                }
                break;
            }
            case KEYBOARD_TYPE: {
                type(ioAction.keyChar);
                robot.delay(75);
                break;
            }
            case MOUSE_WHEEL: {
                mouseWheel(ioAction.wheelAmount);
                break;
            }
        }
    }

    public void type(char character) {
        if(character =='\n' || character =='\r') {
            pressesTimeStamps.add(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss").format(new Date()).toString());
        }
        switch (character) {
            case 'a': doType(VK_A); break;
            case 'b': doType(VK_B); break;
            case 'c': doType(VK_C); break;
            case 'd': doType(VK_D); break;
            case 'e': doType(VK_E); break;
            case 'f': doType(VK_F); break;
            case 'g': doType(VK_G); break;
            case 'h': doType(VK_H); break;
            case 'i': doType(VK_I); break;
            case 'j': doType(VK_J); break;
            case 'k': doType(VK_K); break;
            case 'l': doType(VK_L); break;
            case 'm': doType(VK_M); break;
            case 'n': doType(VK_N); break;
            case 'o': doType(VK_O); break;
            case 'p': doType(VK_P); break;
            case 'q': doType(VK_Q); break;
            case 'r': doType(VK_R); break;
            case 's': doType(VK_S); break;
            case 't': doType(VK_T); break;
            case 'u': doType(VK_U); break;
            case 'v': doType(VK_V); break;
            case 'w': doType(VK_W); break;
            case 'x': doType(VK_X); break;
            case 'y': doType(VK_Y); break;
            case 'z': doType(VK_Z); break;
            case 'A': doType(VK_SHIFT, VK_A); break;
            case 'B': doType(VK_SHIFT, VK_B); break;
            case 'C': doType(VK_SHIFT, VK_C); break;
            case 'D': doType(VK_SHIFT, VK_D); break;
            case 'E': doType(VK_SHIFT, VK_E); break;
            case 'F': doType(VK_SHIFT, VK_F); break;
            case 'G': doType(VK_SHIFT, VK_G); break;
            case 'H': doType(VK_SHIFT, VK_H); break;
            case 'I': doType(VK_SHIFT, VK_I); break;
            case 'J': doType(VK_SHIFT, VK_J); break;
            case 'K': doType(VK_SHIFT, VK_K); break;
            case 'L': doType(VK_SHIFT, VK_L); break;
            case 'M': doType(VK_SHIFT, VK_M); break;
            case 'N': doType(VK_SHIFT, VK_N); break;
            case 'O': doType(VK_SHIFT, VK_O); break;
            case 'P': doType(VK_SHIFT, VK_P); break;
            case 'Q': doType(VK_SHIFT, VK_Q); break;
            case 'R': doType(VK_SHIFT, VK_R); break;
            case 'S': doType(VK_SHIFT, VK_S); break;
            case 'T': doType(VK_SHIFT, VK_T); break;
            case 'U': doType(VK_SHIFT, VK_U); break;
            case 'V': doType(VK_SHIFT, VK_V); break;
            case 'W': doType(VK_SHIFT, VK_W); break;
            case 'X': doType(VK_SHIFT, VK_X); break;
            case 'Y': doType(VK_SHIFT, VK_Y); break;
            case 'Z': doType(VK_SHIFT, VK_Z); break;
            case '`': doType(VK_BACK_QUOTE); break;
            case '0': doType(VK_0); break;
            case '1': doType(VK_1); break;
            case '2': doType(VK_2); break;
            case '3': doType(VK_3); break;
            case '4': doType(VK_4); break;
            case '5': doType(VK_5); break;
            case '6': doType(VK_6); break;
            case '7': doType(VK_7); break;
            case '8': doType(VK_8); break;
            case '9': doType(VK_9); break;
            case '-': doType(VK_MINUS); break;
            case '=': doType(VK_EQUALS); break;
            case '~': doType(VK_SHIFT, VK_BACK_QUOTE); break;
            case '!': doType(VK_EXCLAMATION_MARK); break;
            case '@': doType(VK_AT); break;
            case '#': doType(VK_NUMBER_SIGN); break;
            case '$': doType(VK_DOLLAR); break;
            case '%': doType(VK_SHIFT, VK_5); break;
            case '^': doType(VK_CIRCUMFLEX); break;
            case '&': doType(VK_AMPERSAND); break;
            case '*': doType(VK_ASTERISK); break;
            case '(': doType(VK_LEFT_PARENTHESIS); break;
            case ')': doType(VK_RIGHT_PARENTHESIS); break;
            case '_': doType(VK_UNDERSCORE); break;
            case '+': doType(VK_PLUS); break;
            case '\t': doType(VK_TAB); break;
            case '\n': doType(VK_ENTER); break;
            case '\r': doType(VK_ENTER); break;
            case '\b': doType(VK_BACK_SPACE); break;
            case '[': doType(VK_OPEN_BRACKET); break;
            case ']': doType(VK_CLOSE_BRACKET); break;
            case '\\': doType(VK_BACK_SLASH); break;
            case '{': doType(VK_SHIFT, VK_OPEN_BRACKET); break;
            case '}': doType(VK_SHIFT, VK_CLOSE_BRACKET); break;
            case '|': doType(VK_SHIFT, VK_BACK_SLASH); break;
            case ';': doType(VK_SEMICOLON); break;
            case ':': doType(VK_COLON); break;
            case '\'': doType(VK_QUOTE); break;
            case '"': doType(VK_QUOTEDBL); break;
            case ',': doType(VK_COMMA); break;
            case '<': doType(VK_SHIFT, VK_COMMA); break;
            case '.': doType(VK_PERIOD); break;
            case '>': doType(VK_SHIFT, VK_PERIOD); break;
            case '/': doType(VK_SLASH); break;
            case '?': doType(VK_SHIFT, VK_SLASH); break;
            case ' ': doType(VK_SPACE); break;
            default:
                System.out.println("char not in mappings ");
        }
    }

    private void doType(int... keyCodes) {
        doType(keyCodes, 0, keyCodes.length);
    }

    private void doType(int[] keyCodes, int offset, int length) {
        if (length == 0) {
            return;
        }

        robot.keyPress(keyCodes[offset]);
        doType(keyCodes, offset + 1, length - 1);
        robot.keyRelease(keyCodes[offset]);
    }
}
