import java.util.Date;

public class IOAction {
    public char keyChar;
    public int x;
    public int y;
    public int button;
    public int clickCount;
    public int wheelAmount;
    public ActionType actionType;
    public String timestamp;
    public static enum ActionType {
        KEYBOARD_TYPE, MOUSE_MOVE, MOUSE_PRESS, MOUSE_RELEASE, MOUSE_WHEEL
    }
    public IOAction(ActionType actionType, char keyChar, int x, int y, int button, int clickCount, int wheelAmount,String timestamp) {
        this.actionType = actionType;
        this.keyChar = keyChar;
        this.x = x;
        this.y = y;
        this.button = button;
        this.clickCount = clickCount;
        this.wheelAmount = wheelAmount;
        this.timestamp = timestamp;
    }
}
