To install **whisper.cpp** system-wide on Linux so you can run it from anywhere like a normal command, you basically need to **build it** and then **move the executable to a directory in your PATH**. Here's a step-by-step guide:

---

### 1️⃣ Install dependencies

```bash
sudo apt update
sudo apt install git cmake build-essential
```

---

### 2️⃣ Clone and build

```bash
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
mkdir build
cd build
cmake ..
make -j$(nproc)
```

The `main` executable will be created in `build/`.

---

### 3️⃣ Move the executable to a system PATH

For example, `/usr/local/bin` is standard for user-installed programs:

```bash
sudo cp bin/whisper-cli /usr/local/bin/whisper.cpp
sudo chmod +x /usr/local/bin/whisper.cpp
```

Now you can run `whisper.cpp` from anywhere:

```bash
whisper.cpp -h
```

---

### 4️⃣ Optional: Make a simpler alias

You can make it even shorter:

```bash
sudo ln -s /usr/local/bin/whisper.cpp /usr/local/bin/whisper
```

Then you can just run:

```bash
whisper -h
```

---

✅ After this, whisper.cpp is “installed system-wide” and ready for JSON transcriptions, models, and scripts.

If you want, I can also show how to **download models automatically** and have them stored system-wide so you don’t have to manually put `ggml-*.bin` files in every project. Do you want me to show that?
