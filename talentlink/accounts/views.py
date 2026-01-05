from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import Profile, Notification, Skill
from .serializers import UserRegistrationSerializer, UserSerializer, ProfileSerializer, ProfileUpdateSerializer, UserUpdateSerializer, NotificationSerializer, SkillSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        from django.contrib.auth import authenticate
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.profile
        except Profile.DoesNotExist:
            Profile.objects.create(user=self.request.user, name=self.request.user.username)
            return self.request.user.profile

class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.profile
        except Profile.DoesNotExist:
            Profile.objects.create(user=self.request.user, name=self.request.user.username)
            return self.request.user.profile

    def update(self, request, *args, **kwargs):
        try:
            # Get the serializer and validate
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Perform the update
            response = super().update(request, *args, **kwargs)
            return response
        except Exception as e:
            raise

class UserUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        try:
            response = super().update(request, *args, **kwargs)
            return response
        except Exception as e:
            raise

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserByUsernameView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'username'
    
    def get_object(self):
        return generics.get_object_or_404(User, username=self.kwargs['username'])

class PublicProfileView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')
        try:
            return Profile.objects.get(user_id=user_id)
        except Profile.DoesNotExist:
            # Create profile if it doesn't exist
            user = generics.get_object_or_404(User, id=user_id)
            return Profile.objects.create(user=user, name=user.username)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class NotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class NotificationMarkAsReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def patch(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)

class UnreadNotificationCountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)

class SkillListView(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]