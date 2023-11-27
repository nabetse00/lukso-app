import { useRef, useState } from "react";

const ImageUpload = ({ register, name, errors, trigger }: any) => {
    const hiddenInputRef = useRef<HTMLInputElement>();

    const { ref: registerRef, ...rest } = register(name, { required: true, });

    const [preview, setPreview] = useState<string>();


    const handleUploadedFile = (event: any) => {
        const file = event.target.files[0];
        const urlImage = URL.createObjectURL(file);
        setPreview(urlImage);
        trigger(name)
    };

    // const onUpload = () => {
    //     hiddenInputRef.current!.click();
    // };

    // const uploadButtonLabel = preview ? "Change image" : "Upload image";

    return (
        <div className="form-control w-full">

            <label className="label">
                <span className="label-text">Choose an image for your item</span>
            </label>

            <div className="avatar mb-2 bg-neutral">
                {preview ?
                    <div className="w-32 rounded">
                        <img src={preview} />
                    </div>
                    :
                    <div className="skeleton w-32 h-32"></div>
                }
            </div>


            <input
                type="file"
                className="file-input file-input-bordered grow bg-neutral "
                {...rest}
                onChange={handleUploadedFile}
                ref={(e) => {
                    registerRef(e);
                    hiddenInputRef.current = e!;
                }}
            />

            <label className="label">
                <span className="label-text-alt text-error">
                    {errors[name]?.type == "required" && "File required"}
                </span>
            </label>
        </div>
    );
};

export default ImageUpload;


// <button className="btn" onClick={onUpload}>
// {uploadButtonLabel}
// </button>