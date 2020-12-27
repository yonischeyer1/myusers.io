import org.jnativehook.GlobalScreen;
import org.jnativehook.NativeHookException;
import org.jnativehook.keyboard.NativeKeyEvent;
import org.jnativehook.keyboard.NativeKeyListener;
import org.jnativehook.mouse.NativeMouseEvent;
import org.jnativehook.mouse.NativeMouseInputListener;
import org.jnativehook.mouse.NativeMouseWheelEvent;
import org.jnativehook.mouse.NativeMouseWheelListener;

import java.awt.event.KeyEvent;
import java.io.IOException;
import java.util.Date;


public class IORecorder implements NativeKeyListener, NativeMouseInputListener, NativeMouseWheelListener {
    public IOFile ioFile;
    private String lastThingInClipboard;
    private static IORecorder single_instance = null;

    private IORecorder() {
        ioFile = new IOFile();
    }

    public static IORecorder getInstance()
    {
        if (single_instance == null)
            single_instance = new IORecorder();

        return single_instance;
    }

    public void startRecording() throws NativeHookException {
        GlobalScreen.registerNativeHook();
        GlobalScreen.addNativeKeyListener(this);
        GlobalScreen.addNativeMouseListener(this);
        GlobalScreen.addNativeMouseMotionListener(this);
        GlobalScreen.addNativeMouseWheelListener(this);
//        this.ioPlaybackFile.startRecording();
}

    public String stopRecording() throws NativeHookException, IOException {
        return this.ioFile.searlizeToJson();
    }


    public void nativeKeyTyped(NativeKeyEvent e) {
        int rawCode = e.getRawCode();
        char c = e.getKeyChar();
        this.ioFile.addIOAction(new IOAction(IOAction.ActionType.KEYBOARD_TYPE, c, -1, -1, -1, -1,0, new Date().toString()));
    }

    public boolean isCopy(NativeKeyEvent e) {
        return (e.getKeyCode() == KeyEvent.VK_C) && ((e.getModifiers() & KeyEvent.CTRL_MASK) != 0);
    }

    public boolean isPaste(NativeKeyEvent e) {
        return (e.getKeyCode() == KeyEvent.VK_V) && ((e.getModifiers() & KeyEvent.CTRL_MASK) != 0);
    }

    public void nativeMouseMoved(NativeMouseEvent e) {
        this.ioFile.addIOAction(new IOAction(IOAction.ActionType.MOUSE_MOVE, 'c', e.getX(), e.getY(), -1, -1, 0,new Date().toString()));

    }

    public void nativeMouseReleased(NativeMouseEvent e) {
        this.ioFile.addIOAction(new IOAction(IOAction.ActionType.MOUSE_RELEASE, 'c', e.getX(), e.getY(), e.getButton(), e.getClickCount(), 0, new Date().toString()));

    }

    public void nativeMousePressed(NativeMouseEvent e) {
        this.ioFile.addIOAction(new IOAction(IOAction.ActionType.MOUSE_PRESS, 'c', e.getX(), e.getY(), e.getButton(), e.getClickCount(), 0, new Date().toString()));
    }

    public void nativeMouseWheelMoved(NativeMouseWheelEvent e) {
        int amount = e.getWheelRotation();
        this.ioFile.addIOAction(new IOAction(IOAction.ActionType.MOUSE_WHEEL, 'c', e.getX(), e.getY(), e.getButton(), 0, amount, new Date().toString()));
    }

    public void nativeMouseClicked(NativeMouseEvent e) { }

    public void nativeKeyPressed(NativeKeyEvent e) { }

    public void nativeKeyReleased(NativeKeyEvent e) { }

    public void nativeMouseDragged(NativeMouseEvent e) { }
}
