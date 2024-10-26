from ultralytics import YOLO
from collections import Counter
import cv2
import time
import json
from pytube import YouTube

model = YOLO("runs/detect/train3/weights/best.pt")


""""
#for detection of number of occupied spaces using a picture

img= 'test_test.webp'
results = model (img)
#extract class name for all the detections
object_classes=  [model.names[int(box.cls)] for box in results[0].boxes]  # 'cls' gives the class id

#count each object type

object_counts=Counter(object_classes)

print("Objects detected in the iamge: ")
for obj_class, count in object_counts.items():
    print (f"{obj_class}: {count}")
results[0].show() # useful to see results for a picture

"""

"""

# for detection of number of occupied spaces in a video
video_path ='test2.mp4'
cap=cv2.VideoCapture(video_path)
fps=cap.get(cv2.CAP_PROP_FPS)
width = int (cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height= int (cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
output_video_path= 'results/output_video.mp4'
fourcc=cv2.VideoWriter_fourcc(*'mp4v')
out= cv2.VideoWriter(output_video_path, fourcc, fps,(width, height))


while cap.isOpened():
    ret, frame =cap.read() #here "ret" is a booelan value that determiens if the frame was captured successfully or not, and frame is the captured frame from the input video
    if not ret:
        break

    results= model(frame)

    #Extract class names for detcted objects
    object_classes= [model.names[int(box.cls)] for box in results[0].boxes]
    object_counts= Counter(object_classes) #number of objects detected in that frame

    annotated_frame= results[0].plot()

#now to provide live results, the result updates with each frame
    text_y_position=30  
    for obj_class, count in object_counts.items():
        text= f"{obj_class}: {count}"
        cv2.putText(annotated_frame, text, (50, text_y_position), cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 255, 0), 2, cv2.LINE_AA)
       # text_y_position+20
    out.write(annotated_frame)


cap.release()
out.release()
cv2.destroyAllWindows()

"""

#for capturing a frame from a livestream and processing it evrey 10 secs and upadting a json file


initial_data={

}
#filling up a new json file with initial data
with open ('record.json', 'w') as json_file:
    json.dump(initial_data, json_file, indent=4)
    print ("Initial json file created")


cap=cv2.VideoCapture('test2.mp4') # url of the livestream

if not cap.isOpened():
    print("error: couldnot open the video stream")
    exit()

#variabel to keep track of time
last_capture_time= time.time() #it return the current time in second in refernce to Jan 1st 1970
capture_interval=10 # 10 represnts 10 secs

while True:
    ret, frame= cap.read()

    if not ret:
        print("error: could not read the frame")
        break

    cv2.imshow('Livestream', frame)

    results=model(frame)
    results_list=list(results)

    object_classes= [model.names[int(box.cls)] for box in results_list[0].boxes]
    object_counts= Counter(object_classes) #number of objects detected in that frame

    annotated_frame= results_list[0].plot()



    print ("Object detected in the frame: ")
    for obj_class, count in object_counts.items():
        print (f"{obj_class}: {count}")

    current_time=time.time()

    if current_time-last_capture_time >= capture_interval:
        for obj_class, count in object_counts.items():
            text= f"{obj_class}: {count}"
            cv2.putText(annotated_frame, text, (50, 30), cv2.FONT_HERSHEY_COMPLEX, 0.5, (52, 94, 235), 2, cv2.LINE_AA)
               
               #reading the json file and updating it with new information
            with open ('record.json', 'r') as json_file:
                data=json.load(json_file)
                data["number_of_cars"]=count
            
            with open ('record.json', 'w') as json_file:
                json.dump(data, json_file, indent=4)

        cv2.imwrite(f'captured_frame_{int(current_time)}.jpg', annotated_frame) # save the captured frame for future refernce
        print(f"Frame captured and saved as 'captured_frame_{int(current_time)}.jpg'.")
        last_capture_time=current_time
        

    if cv2.waitKey(1) & 0xFF ==ord ('q'):
        print ("Exiting.....")
        break

cap.release()
cv2.destroyAllWindows()
