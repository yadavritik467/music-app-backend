# in backend

- for installing all the dependencies ---> use npm i

- for running the server you can use --> npm start or npm run dev
- it will run the server on port no. 4500 and it will connecte to my own database

=====================================================================================>>

<!-- backend api -->

- Url = `http://localhost:4500/api/v1/${endPoint} `

<!-- register user post api  -->

- endpoint = `/register`

- payload

```
{
 "firstName":"rk",
 "lastName":"yaduwanshi",
 "email": "rk@gmail.com",
 "password": "Admin12345@",
 "confirmPassword": "Admin12345@"
}

```

<!-- login user post api  -->

- endpoint = `/login`

- payload

```
{
  "email": "rk@gmail.com",
  "password": "Admin12345@"
}

```

<!-- update myProfile put api  -->

- endpoint = `/updateMyProfile`

- payload

```
{
    "firstName":"rk",
 "lastName":"yaduvanshi",
  "email": "rk@gmail.com",
  "password": "Admin12345@"
}

```

<!-- myProfile get api  -->

- endpoint = `/me`

- payload

```
{
  "email": "rk@gmail.com",
  "password": "Admin12345@"
}

```

<!-- upload songs post api  -->

- endpoint = `/uploadSongs`

```
![payload for uploading songs](/assets/img.png)

```

<!-- upload and update post profile picture  -->

- endpoint = `/uploadProfilePicture`

- payload

```
its fieldType should be 'file'  just like a albumImage in upload songs

```

<!-- delete  profile picture  delete api  -->

- endpoint = `/deleteProfilePicture`

<!-- user follow/unFollow  post api -->

# \_id of an user to whom user wants to follow/unfollow

- userId = `65ec953e5378787c80ef51a3`
- endpoint = `/followUnFollow/${userId}`

<!-- singuser  get api -->

- userId = `65625asdsa112425`
- endpoint = `/user-details/${userId}`

<!-- allUsers get api -->

# query params for search function and pagination

- search='ritik'
- page = 1
- limit = 5

* endpoint = `/all-users`

<!-- allSongs get api -->

# query params for search function and pagination

- search='bajrang ban'
- page = 1
- limit = 5

* endpoint = `/all-songs`

<!-- listen songs get api -->

# hit this api only when user click on play button of a song

# you will get the songId in song when u fetch all-songs

- songId = `65eee000d376592e8a20ab93`
- endpoint = `/listenSong/${songId}`
