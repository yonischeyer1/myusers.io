import com.google.gson.Gson;
import org.jnativehook.NativeHookException;
import spark.Request;
import spark.Response;
import spark.Route;

import java.awt.*;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import static spark.Spark.*;

public class main {
    public static int delayBeforeStart = 10000; // 10 sec

    public static void main(String[] args) throws Exception {
        init();
        post("/record/start", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                IORecorder ioRecorder = IORecorder.getInstance();
                ioRecorder.startRecording();
                return "started recording";
            }
        });
        get("/record/stop", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                IORecorder ioRecorder = IORecorder.getInstance();
                String ioActions = ioRecorder.stopRecording();
                return ioActions;
            }
        });
        post("/record/player/start", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                IOPlayer ioPlayer = new IOPlayer();
                Gson gson = new Gson();
                IOAction[] ioActions = gson.fromJson(req.body(), IOAction[].class);
                return ioPlayer.playIOActionsRecorder("recorder",ioActions, "");
            }
        });
        post("/player/start", new Route() {
            @Override
            public Object handle(Request req, Response res) throws Exception {
                IOPlayer ioPlayer = new IOPlayer();
                Gson gson = new Gson();
                String actionId = req.queryMap("actionId").value();
                IOAction[] ioActions = gson.fromJson(req.body(), IOAction[].class);
                return ioPlayer.playIOActions("player",ioActions, actionId);
            }
        });
//        if(args.length > 0) {
//            String mode = args[0];
//            System.out.println("mode " + mode);
//            if(mode.equals("-p")) {
//                playIOFile("recording.io.json");
//            } else {
//                startRecordingIO();
//            }
//        } else {
//            startRecordingIO();
//        }
    }



    public static void init() {
        System.setProperty("java.awt.headless", "false");
    }

    public void playIOFolders(String[] namesOfFoldersToPlay) throws AWTException, FileNotFoundException, NativeHookException, InterruptedException {
        for (String nameOfFolder: namesOfFoldersToPlay) {
            File folder = new File(nameOfFolder);
            File[] listOfFiles = folder.listFiles();

            for (File file : listOfFiles) {
                if (file.isFile()) {
                    playIOFile(file.getName());
                }
            }
        }

    }

    public static void startRecordingIO() throws InterruptedException, NativeHookException {

    }

    public static void playIOFile(final String fileName) throws AWTException, FileNotFoundException, InterruptedException, NativeHookException {
        IOPlayer ioPlayer = null;
        try {
            ioPlayer = new IOPlayer();
        } catch (AWTException e) {
            e.printStackTrace();
        }
        try {
            ioPlayer.replayIOFile(fileName);
        } catch (IOException | AWTException e) {
            e.printStackTrace();
        }
    }
}
